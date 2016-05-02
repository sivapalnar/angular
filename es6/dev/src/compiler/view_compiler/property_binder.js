import * as o from '../output/output_ast';
import { Identifiers } from '../identifiers';
import { DetectChangesVars } from './constants';
import { PropertyBindingType } from '../template_ast';
import { isBlank, isPresent } from 'angular2/src/facade/lang';
import { LifecycleHooks } from 'angular2/src/core/metadata/lifecycle_hooks';
import { isDefaultChangeDetectionStrategy } from 'angular2/src/core/change_detection/constants';
import { camelCaseToDashCase } from '../util';
import { convertCdExpressionToIr } from './expression_converter';
import { CompileBinding } from './compile_binding';
function createBindFieldExpr(exprIndex) {
    return o.THIS_EXPR.prop(`_expr_${exprIndex}`);
}
function createCurrValueExpr(exprIndex) {
    return o.variable(`currVal_${exprIndex}`);
}
function bind(view, currValExpr, fieldExpr, parsedExpression, context, actions, method) {
    var checkExpression = convertCdExpressionToIr(view, context, parsedExpression, DetectChangesVars.valUnwrapper);
    if (isBlank(checkExpression.expression)) {
        // e.g. an empty expression was given
        return;
    }
    // private is fine here as no child view will reference the cached value...
    view.fields.push(new o.ClassField(fieldExpr.name, null, [o.StmtModifier.Private]));
    view.createMethod.addStmt(o.THIS_EXPR.prop(fieldExpr.name).set(o.importExpr(Identifiers.uninitialized)).toStmt());
    if (checkExpression.needsValueUnwrapper) {
        var initValueUnwrapperStmt = DetectChangesVars.valUnwrapper.callMethod('reset', []).toStmt();
        method.addStmt(initValueUnwrapperStmt);
    }
    method.addStmt(currValExpr.set(checkExpression.expression).toDeclStmt(null, [o.StmtModifier.Final]));
    var condition = o.importExpr(Identifiers.checkBinding)
        .callFn([DetectChangesVars.throwOnChange, fieldExpr, currValExpr]);
    if (checkExpression.needsValueUnwrapper) {
        condition = DetectChangesVars.valUnwrapper.prop('hasWrappedValue').or(condition);
    }
    method.addStmt(new o.IfStmt(condition, actions.concat([o.THIS_EXPR.prop(fieldExpr.name).set(currValExpr).toStmt()])));
}
export function bindRenderText(boundText, compileNode, view) {
    var bindingIndex = view.bindings.length;
    view.bindings.push(new CompileBinding(compileNode, boundText));
    var currValExpr = createCurrValueExpr(bindingIndex);
    var valueField = createBindFieldExpr(bindingIndex);
    view.detectChangesRenderPropertiesMethod.resetDebugInfo(compileNode.nodeIndex, boundText);
    bind(view, currValExpr, valueField, boundText.value, view.componentContext, [
        o.THIS_EXPR.prop('renderer')
            .callMethod('setText', [compileNode.renderNode, currValExpr])
            .toStmt()
    ], view.detectChangesRenderPropertiesMethod);
}
function bindAndWriteToRenderer(boundProps, context, compileElement) {
    var view = compileElement.view;
    var renderNode = compileElement.renderNode;
    boundProps.forEach((boundProp) => {
        var bindingIndex = view.bindings.length;
        view.bindings.push(new CompileBinding(compileElement, boundProp));
        view.detectChangesRenderPropertiesMethod.resetDebugInfo(compileElement.nodeIndex, boundProp);
        var fieldExpr = createBindFieldExpr(bindingIndex);
        var currValExpr = createCurrValueExpr(bindingIndex);
        var renderMethod;
        var renderValue = currValExpr;
        var updateStmts = [];
        switch (boundProp.type) {
            case PropertyBindingType.Property:
                renderMethod = 'setElementProperty';
                if (view.genConfig.logBindingUpdate) {
                    updateStmts.push(logBindingUpdateStmt(renderNode, boundProp.name, currValExpr));
                }
                break;
            case PropertyBindingType.Attribute:
                renderMethod = 'setElementAttribute';
                renderValue =
                    renderValue.isBlank().conditional(o.NULL_EXPR, renderValue.callMethod('toString', []));
                break;
            case PropertyBindingType.Class:
                renderMethod = 'setElementClass';
                break;
            case PropertyBindingType.Style:
                renderMethod = 'setElementStyle';
                var strValue = renderValue.callMethod('toString', []);
                if (isPresent(boundProp.unit)) {
                    strValue = strValue.plus(o.literal(boundProp.unit));
                }
                renderValue = renderValue.isBlank().conditional(o.NULL_EXPR, strValue);
                break;
        }
        updateStmts.push(o.THIS_EXPR.prop('renderer')
            .callMethod(renderMethod, [renderNode, o.literal(boundProp.name), renderValue])
            .toStmt());
        bind(view, currValExpr, fieldExpr, boundProp.value, context, updateStmts, view.detectChangesRenderPropertiesMethod);
    });
}
export function bindRenderInputs(boundProps, compileElement) {
    bindAndWriteToRenderer(boundProps, compileElement.view.componentContext, compileElement);
}
export function bindDirectiveHostProps(directiveAst, directiveInstance, compileElement) {
    bindAndWriteToRenderer(directiveAst.hostProperties, directiveInstance, compileElement);
}
export function bindDirectiveInputs(directiveAst, directiveInstance, compileElement) {
    if (directiveAst.inputs.length === 0) {
        return;
    }
    var view = compileElement.view;
    var detectChangesInInputsMethod = view.detectChangesInInputsMethod;
    detectChangesInInputsMethod.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);
    var lifecycleHooks = directiveAst.directive.lifecycleHooks;
    var calcChangesMap = lifecycleHooks.indexOf(LifecycleHooks.OnChanges) !== -1;
    var isOnPushComp = directiveAst.directive.isComponent &&
        !isDefaultChangeDetectionStrategy(directiveAst.directive.changeDetection);
    if (calcChangesMap) {
        detectChangesInInputsMethod.addStmt(DetectChangesVars.changes.set(o.NULL_EXPR).toStmt());
    }
    if (isOnPushComp) {
        detectChangesInInputsMethod.addStmt(DetectChangesVars.changed.set(o.literal(false)).toStmt());
    }
    directiveAst.inputs.forEach((input) => {
        var bindingIndex = view.bindings.length;
        view.bindings.push(new CompileBinding(compileElement, input));
        detectChangesInInputsMethod.resetDebugInfo(compileElement.nodeIndex, input);
        var fieldExpr = createBindFieldExpr(bindingIndex);
        var currValExpr = createCurrValueExpr(bindingIndex);
        var statements = [directiveInstance.prop(input.directiveName).set(currValExpr).toStmt()];
        if (calcChangesMap) {
            statements.push(new o.IfStmt(DetectChangesVars.changes.identical(o.NULL_EXPR), [
                DetectChangesVars.changes.set(o.literalMap([], new o.MapType(o.importType(Identifiers.SimpleChange))))
                    .toStmt()
            ]));
            statements.push(DetectChangesVars.changes.key(o.literal(input.directiveName))
                .set(o.importExpr(Identifiers.SimpleChange).instantiate([fieldExpr, currValExpr]))
                .toStmt());
        }
        if (isOnPushComp) {
            statements.push(DetectChangesVars.changed.set(o.literal(true)).toStmt());
        }
        if (view.genConfig.logBindingUpdate) {
            statements.push(logBindingUpdateStmt(compileElement.renderNode, input.directiveName, currValExpr));
        }
        bind(view, currValExpr, fieldExpr, input.value, view.componentContext, statements, detectChangesInInputsMethod);
    });
    if (isOnPushComp) {
        detectChangesInInputsMethod.addStmt(new o.IfStmt(DetectChangesVars.changed, [
            compileElement.appElement.prop('componentView')
                .callMethod('markAsCheckOnce', [])
                .toStmt()
        ]));
    }
}
function logBindingUpdateStmt(renderNode, propName, value) {
    return o.THIS_EXPR.prop('renderer')
        .callMethod('setBindingDebugInfo', [
        renderNode,
        o.literal(`ng-reflect-${camelCaseToDashCase(propName)}`),
        value.isBlank().conditional(o.NULL_EXPR, value.callMethod('toString', []))
    ])
        .toStmt();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHlfYmluZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1WNzdrYUVwRy50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvcHJvcGVydHlfYmluZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUNPLEtBQUssQ0FBQyxNQUFNLHNCQUFzQjtPQUNsQyxFQUFDLFdBQVcsRUFBQyxNQUFNLGdCQUFnQjtPQUNuQyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sYUFBYTtPQUV0QyxFQUlMLG1CQUFtQixFQUVwQixNQUFNLGlCQUFpQjtPQUVqQixFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQVUsTUFBTSwwQkFBMEI7T0FNN0QsRUFBQyxjQUFjLEVBQUMsTUFBTSw0Q0FBNEM7T0FDbEUsRUFBQyxnQ0FBZ0MsRUFBQyxNQUFNLDhDQUE4QztPQUN0RixFQUFDLG1CQUFtQixFQUFDLE1BQU0sU0FBUztPQUVwQyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sd0JBQXdCO09BRXZELEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CO0FBRWhELDZCQUE2QixTQUFpQjtJQUM1QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRCw2QkFBNkIsU0FBaUI7SUFDNUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFFRCxjQUFjLElBQWlCLEVBQUUsV0FBMEIsRUFBRSxTQUF5QixFQUN4RSxnQkFBMkIsRUFBRSxPQUFxQixFQUFFLE9BQXNCLEVBQzFFLE1BQXFCO0lBQ2pDLElBQUksZUFBZSxHQUNmLHVCQUF1QixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsWUFBWSxDQUFD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MkIsQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUNqQiwyQkFBMkIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRTtZQUMxRSxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7aUJBQzFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUM7aUJBQ2pDLE1BQU0sRUFBRTtTQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQztBQUNILENBQUM7QUFFRCw4QkFBOEIsVUFBd0IsRUFBRSxRQUFnQixFQUMxQyxLQUFtQjtJQUMvQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1NBQzlCLFVBQVUsQ0FBQyxxQkFBcUIsRUFDckI7UUFDRSxVQUFVO1FBQ1YsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDeEQsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzNFLENBQUM7U0FDYixNQUFNLEVBQUUsQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RBc3QgZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVyc30gZnJvbSAnLi4vaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtEZXRlY3RDaGFuZ2VzVmFyc30gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5pbXBvcnQge1xuICBCb3VuZFRleHRBc3QsXG4gIEJvdW5kRWxlbWVudFByb3BlcnR5QXN0LFxuICBEaXJlY3RpdmVBc3QsXG4gIFByb3BlcnR5QmluZGluZ1R5cGUsXG4gIFRlbXBsYXRlQXN0XG59IGZyb20gJy4uL3RlbXBsYXRlX2FzdCc7XG5cbmltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50LCBpc0FycmF5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0NvbXBpbGVWaWV3fSBmcm9tICcuL2NvbXBpbGVfdmlldyc7XG5pbXBvcnQge0NvbXBpbGVFbGVtZW50LCBDb21waWxlTm9kZX0gZnJvbSAnLi9jb21waWxlX2VsZW1lbnQnO1xuaW1wb3J0IHtDb21waWxlTWV0aG9kfSBmcm9tICcuL2NvbXBpbGVfbWV0aG9kJztcblxuaW1wb3J0IHtMaWZlY3ljbGVIb29rc30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzJztcbmltcG9ydCB7aXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY29uc3RhbnRzJztcbmltcG9ydCB7Y2FtZWxDYXNlVG9EYXNoQ2FzZX0gZnJvbSAnLi4vdXRpbCc7XG5cbmltcG9ydCB7Y29udmVydENkRXhwcmVzc2lvblRvSXJ9IGZyb20gJy4vZXhwcmVzc2lvbl9jb252ZXJ0ZXInO1xuXG5pbXBvcnQge0NvbXBpbGVCaW5kaW5nfSBmcm9tICcuL2NvbXBpbGVfYmluZGluZyc7XG5cbmZ1bmN0aW9uIGNyZWF0ZUJpbmRGaWVsZEV4cHIoZXhwckluZGV4OiBudW1iZXIpOiBvLlJlYWRQcm9wRXhwciB7XG4gIHJldHVybiBvLlRISVNfRVhQUi5wcm9wKGBfZXhwcl8ke2V4cHJJbmRleH1gKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ3VyclZhbHVlRXhwcihleHBySW5kZXg6IG51bWJlcik6IG8uUmVhZFZhckV4cHIge1xuICByZXR1cm4gby52YXJpYWJsZShgY3VyclZhbF8ke2V4cHJJbmRleH1gKTtcbn1cblxuZnVuY3Rpb24gYmluZCh2aWV3OiBDb21waWxlVmlldywgY3VyclZhbEV4cHI6IG8uUmVhZFZhckV4cHIsIGZpZWxkRXhwcjogby5SZWFkUHJvcEV4cHIsXG4gICAgICAgICAgICAgIHBhcnNlZEV4cHJlc3Npb246IGNkQXN0LkFTVCwgY29udGV4dDogby5FeHByZXNzaW9uLCBhY3Rpb25zOiBvLlN0YXRlbWVudFtdLFxuICAgICAgICAgICAgICBtZXRob2Q6IENvbXBpbGVNZXRob2QpIHtcbiAgdmFyIGNoZWNrRXhwcmVzc2lvbiA9XG4gICAgICBjb252ZXJ0Q2RFeHByZXNzaW9uVG9Jcih2aWV3LCBjb250ZXh0LCBwYXJzZWRFeHByZXNzaW9uLCBEZXRlY3RDaGFuZ2VzVmFycy52YWxVbndyYXBwZXIpO1xuICBpZiAoaXNCbGFuayhjaGVja0V4cHJlc3Npb24uZXhwcmVzc2lvbikpIHtcbiAgICAvLyBlLmcuIGFuIGVtcHR5IGV4cHJlc3Npb24gd2FzIGdpdmVuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gcHJpdmF0ZSBpcyBmaW5lIGhlcmUgYXMgbm8gY2hpbGQgdmlldyB3aWxsIHJlZmVyZW5jZSB0aGUgY2FjaGVkIHZhbHVlLi4uXG4gIHZpZXcuZmllbGRzLnB1c2gobmV3IG8uQ2xhc3NGaWVsZChmaWVsZEV4cHIubmFtZSwgbnVsbCwgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gIHZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoXG4gICAgICBvLlRISVNfRVhQUi5wcm9wKGZpZWxkRXhwci5uYW1lKS5zZXQoby5pbXBvcnRFeHByKElkZW50aWZpZXJzLnVuaW5pdGlhbGl6ZWQpKS50b1N0bXQoKSk7XG5cbiAgaWYgKGNoZWNrRXhwcmVzc2lvbi5uZWVkc1ZhbHVlVW53cmFwcGVyKSB7XG4gICAgdmFyIGluaXRWYWx1ZVVud3JhcHBlclN0bXQgPSBEZXRlY3RDaGFuZ2VzVmFycy52YWxVbndyYXBwZXIuY2FsbE1ldGhvZCgncmVzZXQnLCBbXSkudG9TdG10KCk7XG4gICAgbWV0aG9kLmFkZFN0bXQoaW5pdFZhbHVlVW53cmFwcGVyU3RtdCk7XG4gIH1cbiAgbWV0aG9kLmFkZFN0bXQoXG4gICAgICBjdXJyVmFsRXhwci5zZXQoY2hlY2tFeHByZXNzaW9uLmV4cHJlc3Npb24pLnRvRGVjbFN0bXQobnVsbCwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuXG4gIHZhciBjb25kaXRpb246IG8uRXhwcmVzc2lvbiA9XG4gICAgICBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuY2hlY2tCaW5kaW5nKVxuICAgICAgICAgIC5jYWxsRm4oW0RldGVjdENoYW5nZXNWYXJzLnRocm93T25DaGFuZ2UsIGZpZWxkRXhwciwgY3VyclZhbEV4cHJdKTtcbiAgaWYgKGNoZWNrRXhwcmVzc2lvbi5uZWVkc1ZhbHVlVW53cmFwcGVyKSB7XG4gICAgY29uZGl0aW9uID0gRGV0ZWN0Q2hhbmdlc1ZhcnMudmFsVW53cmFwcGVyLnByb3AoJ2hhc1dyYXBwZWRWYWx1ZScpLm9yKGNvbmRpdGlvbik7XG4gIH1cbiAgbWV0aG9kLmFkZFN0bXQobmV3IG8uSWZTdG10KFxuICAgICAgY29uZGl0aW9uLFxuICAgICAgYWN0aW9ucy5jb25jYXQoWzxvLlN0YXRlbWVudD5vLlRISVNfRVhQUi5wcm9wKGZpZWxkRXhwci5uYW1lKS5zZXQoY3VyclZhbEV4cHIpLnRvU3RtdCgpXSkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRSZW5kZXJUZXh0KGJvdW5kVGV4dDogQm91bmRUZXh0QXN0LCBjb21waWxlTm9kZTogQ29tcGlsZU5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldzogQ29tcGlsZVZpZXcpIHtcbiAgdmFyIGJpbmRpbmdJbmRleCA9IHZpZXcuYmluZGluZ3MubGVuZ3RoO1xuICB2aWV3LmJpbmRpbmdzLnB1c2gobmV3IENvbXBpbGVCaW5kaW5nKGNvbXBpbGVOb2RlLCBib3VuZFRleHQpKTtcbiAgdmFyIGN1cnJWYWxFeHByID0gY3JlYXRlQ3VyclZhbHVlRXhwcihiaW5kaW5nSW5kZXgpO1xuICB2YXIgdmFsdWVGaWVsZCA9IGNyZWF0ZUJpbmRGaWVsZEV4cHIoYmluZGluZ0luZGV4KTtcbiAgdmlldy5kZXRlY3RDaGFuZ2VzUmVuZGVyUHJvcGVydGllc01ldGhvZC5yZXNldERlYnVnSW5mbyhjb21waWxlTm9kZS5ub2RlSW5kZXgsIGJvdW5kVGV4dCk7XG5cbiAgYmluZCh2aWV3LCBjdXJyVmFsRXhwciwgdmFsdWVGaWVsZCwgYm91bmRUZXh0LnZhbHVlLCB2aWV3LmNvbXBvbmVudENvbnRleHQsXG4gICAgICAgW1xuICAgICAgICAgby5USElTX0VYUFIucHJvcCgncmVuZGVyZXInKVxuICAgICAgICAgICAgIC5jYWxsTWV0aG9kKCdzZXRUZXh0JywgW2NvbXBpbGVOb2RlLnJlbmRlck5vZGUsIGN1cnJWYWxFeHByXSlcbiAgICAgICAgICAgICAudG9TdG10KClcbiAgICAgICBdLFxuICAgICAgIHZpZXcuZGV0ZWN0Q2hhbmdlc1JlbmRlclByb3BlcnRpZXNNZXRob2QpO1xufVxuXG5mdW5jdGlvbiBiaW5kQW5kV3JpdGVUb1JlbmRlcmVyKGJvdW5kUHJvcHM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10sIGNvbnRleHQ6IG8uRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVsZW1lbnQ6IENvbXBpbGVFbGVtZW50KSB7XG4gIHZhciB2aWV3ID0gY29tcGlsZUVsZW1lbnQudmlldztcbiAgdmFyIHJlbmRlck5vZGUgPSBjb21waWxlRWxlbWVudC5yZW5kZXJOb2RlO1xuICBib3VuZFByb3BzLmZvckVhY2goKGJvdW5kUHJvcCkgPT4ge1xuICAgIHZhciBiaW5kaW5nSW5kZXggPSB2aWV3LmJpbmRpbmdzLmxlbmd0aDtcbiAgICB2aWV3LmJpbmRpbmdzLnB1c2gobmV3IENvbXBpbGVCaW5kaW5nKGNvbXBpbGVFbGVtZW50LCBib3VuZFByb3ApKTtcbiAgICB2aWV3LmRldGVjdENoYW5nZXNSZW5kZXJQcm9wZXJ0aWVzTWV0aG9kLnJlc2V0RGVidWdJbmZvKGNvbXBpbGVFbGVtZW50Lm5vZGVJbmRleCwgYm91bmRQcm9wKTtcbiAgICB2YXIgZmllbGRFeHByID0gY3JlYXRlQmluZEZpZWxkRXhwcihiaW5kaW5nSW5kZXgpO1xuICAgIHZhciBjdXJyVmFsRXhwciA9IGNyZWF0ZUN1cnJWYWx1ZUV4cHIoYmluZGluZ0luZGV4KTtcbiAgICB2YXIgcmVuZGVyTWV0aG9kOiBzdHJpbmc7XG4gICAgdmFyIHJlbmRlclZhbHVlOiBvLkV4cHJlc3Npb24gPSBjdXJyVmFsRXhwcjtcbiAgICB2YXIgdXBkYXRlU3RtdHMgPSBbXTtcbiAgICBzd2l0Y2ggKGJvdW5kUHJvcC50eXBlKSB7XG4gICAgICBjYXNlIFByb3BlcnR5QmluZGluZ1R5cGUuUHJvcGVydHk6XG4gICAgICAgIHJlbmRlck1ldGhvZCA9ICdzZXRFbGVtZW50UHJvcGVydHknO1xuICAgICAgICBpZiAodmlldy5nZW5Db25maWcubG9nQmluZGluZ1VwZGF0ZSkge1xuICAgICAgICAgIHVwZGF0ZVN0bXRzLnB1c2gobG9nQmluZGluZ1VwZGF0ZVN0bXQocmVuZGVyTm9kZSwgYm91bmRQcm9wLm5hbWUsIGN1cnJWYWxFeHByKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFByb3BlcnR5QmluZGluZ1R5cGUuQXR0cmlidXRlOlxuICAgICAgICByZW5kZXJNZXRob2QgPSAnc2V0RWxlbWVudEF0dHJpYnV0ZSc7XG4gICAgICAgIHJlbmRlclZhbHVlID1cbiAgICAgICAgICAgIHJlbmRlclZhbHVlLmlzQmxhbmsoKS5jb25kaXRpb25hbChvLk5VTExfRVhQUiwgcmVuZGVyVmFsdWUuY2FsbE1ldGhvZCgndG9TdHJpbmcnLCBbXSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUHJvcGVydHlCaW5kaW5nVHlwZS5DbGFzczpcbiAgICAgICAgcmVuZGVyTWV0aG9kID0gJ3NldEVsZW1lbnRDbGFzcyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBQcm9wZXJ0eUJpbmRpbmdUeXBlLlN0eWxlOlxuICAgICAgICByZW5kZXJNZXRob2QgPSAnc2V0RWxlbWVudFN0eWxlJztcbiAgICAgICAgdmFyIHN0clZhbHVlOiBvLkV4cHJlc3Npb24gPSByZW5kZXJWYWx1ZS5jYWxsTWV0aG9kKCd0b1N0cmluZycsIFtdKTtcbiAgICAgICAgaWYgKGlzUHJlc2VudChib3VuZFByb3AudW5pdCkpIHtcbiAgICAgICAgICBzdHJWYWx1ZSA9IHN0clZhbHVlLnBsdXMoby5saXRlcmFsKGJvdW5kUHJvcC51bml0KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyVmFsdWUgPSByZW5kZXJWYWx1ZS5pc0JsYW5rKCkuY29uZGl0aW9uYWwoby5OVUxMX0VYUFIsIHN0clZhbHVlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHVwZGF0ZVN0bXRzLnB1c2goXG4gICAgICAgIG8uVEhJU19FWFBSLnByb3AoJ3JlbmRlcmVyJylcbiAgICAgICAgICAgIC5jYWxsTWV0aG9kKHJlbmRlck1ldGhvZCwgW3JlbmRlck5vZGUsIG8ubGl0ZXJhbChib3VuZFByb3AubmFtZSksIHJlbmRlclZhbHVlXSlcbiAgICAgICAgICAgIC50b1N0bXQoKSk7XG5cbiAgICBiaW5kKHZpZXcsIGN1cnJWYWxFeHByLCBmaWVsZEV4cHIsIGJvdW5kUHJvcC52YWx1ZSwgY29udGV4dCwgdXBkYXRlU3RtdHMsXG4gICAgICAgICB2aWV3LmRldGVjdENoYW5nZXNSZW5kZXJQcm9wZXJ0aWVzTWV0aG9kKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUmVuZGVySW5wdXRzKGJvdW5kUHJvcHM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRWxlbWVudDogQ29tcGlsZUVsZW1lbnQpOiB2b2lkIHtcbiAgYmluZEFuZFdyaXRlVG9SZW5kZXJlcihib3VuZFByb3BzLCBjb21waWxlRWxlbWVudC52aWV3LmNvbXBvbmVudENvbnRleHQsIGNvbXBpbGVFbGVtZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmREaXJlY3RpdmVIb3N0UHJvcHMoZGlyZWN0aXZlQXN0OiBEaXJlY3RpdmVBc3QsIGRpcmVjdGl2ZUluc3RhbmNlOiBvLkV4cHJlc3Npb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRWxlbWVudDogQ29tcGlsZUVsZW1lbnQpOiB2b2lkIHtcbiAgYmluZEFuZFdyaXRlVG9SZW5kZXJlcihkaXJlY3RpdmVBc3QuaG9zdFByb3BlcnRpZXMsIGRpcmVjdGl2ZUluc3RhbmNlLCBjb21waWxlRWxlbWVudCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kRGlyZWN0aXZlSW5wdXRzKGRpcmVjdGl2ZUFzdDogRGlyZWN0aXZlQXN0LCBkaXJlY3RpdmVJbnN0YW5jZTogby5FeHByZXNzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZUVsZW1lbnQ6IENvbXBpbGVFbGVtZW50KSB7XG4gIGlmIChkaXJlY3RpdmVBc3QuaW5wdXRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgdmlldyA9IGNvbXBpbGVFbGVtZW50LnZpZXc7XG4gIHZhciBkZXRlY3RDaGFuZ2VzSW5JbnB1dHNNZXRob2QgPSB2aWV3LmRldGVjdENoYW5nZXNJbklucHV0c01ldGhvZDtcbiAgZGV0ZWN0Q2hhbmdlc0luSW5wdXRzTWV0aG9kLnJlc2V0RGVidWdJbmZvKGNvbXBpbGVFbGVtZW50Lm5vZGVJbmRleCwgY29tcGlsZUVsZW1lbnQuc291cmNlQXN0KTtcblxuICB2YXIgbGlmZWN5Y2xlSG9va3MgPSBkaXJlY3RpdmVBc3QuZGlyZWN0aXZlLmxpZmVjeWNsZUhvb2tzO1xuICB2YXIgY2FsY0NoYW5nZXNNYXAgPSBsaWZlY3ljbGVIb29rcy5pbmRleE9mKExpZmVjeWNsZUhvb2tzLk9uQ2hhbmdlcykgIT09IC0xO1xuICB2YXIgaXNPblB1c2hDb21wID0gZGlyZWN0aXZlQXN0LmRpcmVjdGl2ZS5pc0NvbXBvbmVudCAmJlxuICAgICAgICAgICAgICAgICAgICAgIWlzRGVmYXVsdENoYW5nZURldGVjdGlvblN0cmF0ZWd5KGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUuY2hhbmdlRGV0ZWN0aW9uKTtcbiAgaWYgKGNhbGNDaGFuZ2VzTWFwKSB7XG4gICAgZGV0ZWN0Q2hhbmdlc0luSW5wdXRzTWV0aG9kLmFkZFN0bXQoRGV0ZWN0Q2hhbmdlc1ZhcnMuY2hhbmdlcy5zZXQoby5OVUxMX0VYUFIpLnRvU3RtdCgpKTtcbiAgfVxuICBpZiAoaXNPblB1c2hDb21wKSB7XG4gICAgZGV0ZWN0Q2hhbmdlc0luSW5wdXRzTWV0aG9kLmFkZFN0bXQoRGV0ZWN0Q2hhbmdlc1ZhcnMuY2hhbmdlZC5zZXQoby5saXRlcmFsKGZhbHNlKSkudG9TdG10KCkpO1xuICB9XG4gIGRpcmVjdGl2ZUFzdC5pbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IHtcbiAgICB2YXIgYmluZGluZ0luZGV4ID0gdmlldy5iaW5kaW5ncy5sZW5ndGg7XG4gICAgdmlldy5iaW5kaW5ncy5wdXNoKG5ldyBDb21waWxlQmluZGluZyhjb21waWxlRWxlbWVudCwgaW5wdXQpKTtcbiAgICBkZXRlY3RDaGFuZ2VzSW5JbnB1dHNNZXRob2QucmVzZXREZWJ1Z0luZm8oY29tcGlsZUVsZW1lbnQubm9kZUluZGV4LCBpbnB1dCk7XG4gICAgdmFyIGZpZWxkRXhwciA9IGNyZWF0ZUJpbmRGaWVsZEV4cHIoYmluZGluZ0luZGV4KTtcbiAgICB2YXIgY3VyclZhbEV4cHIgPSBjcmVhdGVDdXJyVmFsdWVFeHByKGJpbmRpbmdJbmRleCk7XG4gICAgdmFyIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPVxuICAgICAgICBbZGlyZWN0aXZlSW5zdGFuY2UucHJvcChpbnB1dC5kaXJlY3RpdmVOYW1lKS5zZXQoY3VyclZhbEV4cHIpLnRvU3RtdCgpXTtcbiAgICBpZiAoY2FsY0NoYW5nZXNNYXApIHtcbiAgICAgIHN0YXRlbWVudHMucHVzaChuZXcgby5JZlN0bXQoRGV0ZWN0Q2hhbmdlc1ZhcnMuY2hhbmdlcy5pZGVudGljYWwoby5OVUxMX0VYUFIpLCBbXG4gICAgICAgIERldGVjdENoYW5nZXNWYXJzLmNoYW5nZXMuc2V0KG8ubGl0ZXJhbE1hcChbXSwgbmV3IG8uTWFwVHlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlNpbXBsZUNoYW5nZSkpKSlcbiAgICAgICAgICAgIC50b1N0bXQoKVxuICAgICAgXSkpO1xuICAgICAgc3RhdGVtZW50cy5wdXNoKFxuICAgICAgICAgIERldGVjdENoYW5nZXNWYXJzLmNoYW5nZXMua2V5KG8ubGl0ZXJhbChpbnB1dC5kaXJlY3RpdmVOYW1lKSlcbiAgICAgICAgICAgICAgLnNldChvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuU2ltcGxlQ2hhbmdlKS5pbnN0YW50aWF0ZShbZmllbGRFeHByLCBjdXJyVmFsRXhwcl0pKVxuICAgICAgICAgICAgICAudG9TdG10KCkpO1xuICAgIH1cbiAgICBpZiAoaXNPblB1c2hDb21wKSB7XG4gICAgICBzdGF0ZW1lbnRzLnB1c2goRGV0ZWN0Q2hhbmdlc1ZhcnMuY2hhbmdlZC5zZXQoby5saXRlcmFsKHRydWUpKS50b1N0bXQoKSk7XG4gICAgfVxuICAgIGlmICh2aWV3LmdlbkNvbmZpZy5sb2dCaW5kaW5nVXBkYXRlKSB7XG4gICAgICBzdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgICAgbG9nQmluZGluZ1VwZGF0ZVN0bXQoY29tcGlsZUVsZW1lbnQucmVuZGVyTm9kZSwgaW5wdXQuZGlyZWN0aXZlTmFtZSwgY3VyclZhbEV4cHIpKTtcbiAgICB9XG4gICAgYmluZCh2aWV3LCBjdXJyVmFsRXhwciwgZmllbGRFeHByLCBpbnB1dC52YWx1ZSwgdmlldy5jb21wb25lbnRDb250ZXh0LCBzdGF0ZW1lbnRzLFxuICAgICAgICAgZGV0ZWN0Q2hhbmdlc0luSW5wdXRzTWV0aG9kKTtcbiAgfSk7XG4gIGlmIChpc09uUHVzaENvbXApIHtcbiAgICBkZXRlY3RDaGFuZ2VzSW5JbnB1dHNNZXRob2QuYWRkU3RtdChuZXcgby5JZlN0bXQoRGV0ZWN0Q2hhbmdlc1ZhcnMuY2hhbmdlZCwgW1xuICAgICAgY29tcGlsZUVsZW1lbnQuYXBwRWxlbWVudC5wcm9wKCdjb21wb25lbnRWaWV3JylcbiAgICAgICAgICAuY2FsbE1ldGhvZCgnbWFya0FzQ2hlY2tPbmNlJywgW10pXG4gICAgICAgICAgLnRvU3RtdCgpXG4gICAgXSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvZ0JpbmRpbmdVcGRhdGVTdG10KHJlbmRlck5vZGU6IG8uRXhwcmVzc2lvbiwgcHJvcE5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBvLkV4cHJlc3Npb24pOiBvLlN0YXRlbWVudCB7XG4gIHJldHVybiBvLlRISVNfRVhQUi5wcm9wKCdyZW5kZXJlcicpXG4gICAgICAuY2FsbE1ldGhvZCgnc2V0QmluZGluZ0RlYnVnSW5mbycsXG4gICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlck5vZGUsXG4gICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChgbmctcmVmbGVjdC0ke2NhbWVsQ2FzZVRvRGFzaENhc2UocHJvcE5hbWUpfWApLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5pc0JsYW5rKCkuY29uZGl0aW9uYWwoby5OVUxMX0VYUFIsIHZhbHVlLmNhbGxNZXRob2QoJ3RvU3RyaW5nJywgW10pKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgIC50b1N0bXQoKTtcbn1cbiJdfQ==