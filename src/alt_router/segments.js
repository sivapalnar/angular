'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var Tree = (function () {
    function Tree(root) {
        this._root = root;
    }
    Object.defineProperty(Tree.prototype, "root", {
        get: function () { return this._root.value; },
        enumerable: true,
        configurable: true
    });
    Tree.prototype.parent = function (t) {
        var p = this.pathFromRoot(t);
        return p.length > 1 ? p[p.length - 2] : null;
    };
    Tree.prototype.children = function (t) {
        var n = _findNode(t, this._root);
        return lang_1.isPresent(n) ? n.children.map(function (t) { return t.value; }) : null;
    };
    Tree.prototype.firstChild = function (t) {
        var n = _findNode(t, this._root);
        return lang_1.isPresent(n) && n.children.length > 0 ? n.children[0].value : null;
    };
    Tree.prototype.pathFromRoot = function (t) { return _findPath(t, this._root, []).map(function (s) { return s.value; }); };
    Tree.prototype.contains = function (tree) { return _contains(this._root, tree._root); };
    return Tree;
}());
exports.Tree = Tree;
var UrlTree = (function (_super) {
    __extends(UrlTree, _super);
    function UrlTree(root) {
        _super.call(this, root);
    }
    return UrlTree;
}(Tree));
exports.UrlTree = UrlTree;
var RouteTree = (function (_super) {
    __extends(RouteTree, _super);
    function RouteTree(root) {
        _super.call(this, root);
    }
    return RouteTree;
}(Tree));
exports.RouteTree = RouteTree;
function rootNode(tree) {
    return tree._root;
}
exports.rootNode = rootNode;
function _findNode(expected, c) {
    // TODO: vsavkin remove it once recognize is fixed
    if (expected instanceof RouteSegment && equalSegments(expected, c.value))
        return c;
    if (expected === c.value)
        return c;
    for (var _i = 0, _a = c.children; _i < _a.length; _i++) {
        var cc = _a[_i];
        var r = _findNode(expected, cc);
        if (lang_1.isPresent(r))
            return r;
    }
    return null;
}
function _findPath(expected, c, collected) {
    collected.push(c);
    // TODO: vsavkin remove it once recognize is fixed
    if (_equalValues(expected, c.value))
        return collected;
    for (var _i = 0, _a = c.children; _i < _a.length; _i++) {
        var cc = _a[_i];
        var r = _findPath(expected, cc, collection_1.ListWrapper.clone(collected));
        if (lang_1.isPresent(r))
            return r;
    }
    return null;
}
function _contains(tree, subtree) {
    if (!_equalValues(tree.value, subtree.value))
        return false;
    var _loop_1 = function(subtreeNode) {
        var s = tree.children.filter(function (child) { return _equalValues(child.value, subtreeNode.value); });
        if (s.length === 0)
            return { value: false };
        if (!_contains(s[0], subtreeNode))
            return { value: false };
    };
    for (var _i = 0, _a = subtree.children; _i < _a.length; _i++) {
        var subtreeNode = _a[_i];
        var state_1 = _loop_1(subtreeNode);
        if (typeof state_1 === "object") return state_1.value;
    }
    return true;
}
function _equalValues(a, b) {
    if (a instanceof RouteSegment)
        return equalSegments(a, b);
    if (a instanceof UrlSegment)
        return equalUrlSegments(a, b);
    return a === b;
}
var TreeNode = (function () {
    function TreeNode(value, children) {
        this.value = value;
        this.children = children;
    }
    return TreeNode;
}());
exports.TreeNode = TreeNode;
var UrlSegment = (function () {
    function UrlSegment(segment, parameters, outlet) {
        this.segment = segment;
        this.parameters = parameters;
        this.outlet = outlet;
    }
    UrlSegment.prototype.toString = function () {
        var outletPrefix = lang_1.isBlank(this.outlet) ? "" : this.outlet + ":";
        var segmentPrefix = lang_1.isBlank(this.segment) ? "" : this.segment;
        return "" + outletPrefix + segmentPrefix + _serializeParams(this.parameters);
    };
    return UrlSegment;
}());
exports.UrlSegment = UrlSegment;
function _serializeParams(params) {
    var res = "";
    if (lang_1.isPresent(params)) {
        collection_1.StringMapWrapper.forEach(params, function (v, k) { return res += ";" + k + "=" + v; });
    }
    return res;
}
var RouteSegment = (function () {
    function RouteSegment(urlSegments, parameters, outlet, type, componentFactory) {
        this.urlSegments = urlSegments;
        this.parameters = parameters;
        this.outlet = outlet;
        this._type = type;
        this._componentFactory = componentFactory;
    }
    RouteSegment.prototype.getParam = function (param) {
        return lang_1.isPresent(this.parameters) ? this.parameters[param] : null;
    };
    Object.defineProperty(RouteSegment.prototype, "type", {
        get: function () { return this._type; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RouteSegment.prototype, "stringifiedUrlSegments", {
        get: function () { return this.urlSegments.map(function (s) { return s.toString(); }).join("/"); },
        enumerable: true,
        configurable: true
    });
    return RouteSegment;
}());
exports.RouteSegment = RouteSegment;
function serializeRouteSegmentTree(tree) {
    return _serializeRouteSegmentTree(tree._root);
}
exports.serializeRouteSegmentTree = serializeRouteSegmentTree;
function _serializeRouteSegmentTree(node) {
    var v = node.value;
    var children = node.children.map(function (c) { return _serializeRouteSegmentTree(c); }).join(", ");
    return v.outlet + ":" + v.stringifiedUrlSegments + "(" + lang_1.stringify(v.type) + ") [" + children + "]";
}
function equalSegments(a, b) {
    if (lang_1.isBlank(a) && !lang_1.isBlank(b))
        return false;
    if (!lang_1.isBlank(a) && lang_1.isBlank(b))
        return false;
    if (a._type !== b._type)
        return false;
    if (a.outlet != b.outlet)
        return false;
    if (lang_1.isBlank(a.parameters) && !lang_1.isBlank(b.parameters))
        return false;
    if (!lang_1.isBlank(a.parameters) && lang_1.isBlank(b.parameters))
        return false;
    if (lang_1.isBlank(a.parameters) && lang_1.isBlank(b.parameters))
        return true;
    return collection_1.StringMapWrapper.equals(a.parameters, b.parameters);
}
exports.equalSegments = equalSegments;
function equalUrlSegments(a, b) {
    if (lang_1.isBlank(a) && !lang_1.isBlank(b))
        return false;
    if (!lang_1.isBlank(a) && lang_1.isBlank(b))
        return false;
    if (a.segment != b.segment)
        return false;
    if (a.outlet != b.outlet)
        return false;
    if (lang_1.isBlank(a.parameters) && !lang_1.isBlank(b.parameters))
        return false;
    if (!lang_1.isBlank(a.parameters) && lang_1.isBlank(b.parameters))
        return false;
    if (lang_1.isBlank(a.parameters) && lang_1.isBlank(b.parameters))
        return true;
    return collection_1.StringMapWrapper.equals(a.parameters, b.parameters);
}
exports.equalUrlSegments = equalUrlSegments;
function routeSegmentComponentFactory(a) {
    return a._componentFactory;
}
exports.routeSegmentComponentFactory = routeSegmentComponentFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLTEyR1QzUEp2LnRtcC9hbmd1bGFyMi9zcmMvYWx0X3JvdXRlci9zZWdtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RSxxQkFBa0QsMEJBQTBCLENBQUMsQ0FBQTtBQUU3RTtJQUlFLGNBQVksSUFBaUI7UUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUFDLENBQUM7SUFFckQsc0JBQUksc0JBQUk7YUFBUixjQUFnQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUUxQyxxQkFBTSxHQUFOLFVBQU8sQ0FBSTtRQUNULElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUMvQyxDQUFDO0lBRUQsdUJBQVEsR0FBUixVQUFTLENBQUk7UUFDWCxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsZ0JBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxLQUFLLEVBQVAsQ0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQzVELENBQUM7SUFFRCx5QkFBVSxHQUFWLFVBQVcsQ0FBSTtRQUNiLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtB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Q0FBQztJQUNoRSxNQUFNLENBQUMsNkJBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFUZSx3QkFBZ0IsbUJBUy9CLENBQUE7QUFFRCxzQ0FBNkMsQ0FBZTtJQUMxRCxNQUFNLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO0FBQzdCLENBQUM7QUFGZSxvQ0FBNEIsK0JBRTNDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudEZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7VHlwZSwgaXNCbGFuaywgaXNQcmVzZW50LCBzdHJpbmdpZnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmV4cG9ydCBjbGFzcyBUcmVlPFQ+IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcm9vdDogVHJlZU5vZGU8VD47XG5cbiAgY29uc3RydWN0b3Iocm9vdDogVHJlZU5vZGU8VD4pIHsgdGhpcy5fcm9vdCA9IHJvb3Q7IH1cblxuICBnZXQgcm9vdCgpOiBUIHsgcmV0dXJuIHRoaXMuX3Jvb3QudmFsdWU7IH1cblxuICBwYXJlbnQodDogVCk6IFQge1xuICAgIGxldCBwID0gdGhpcy5wYXRoRnJvbVJvb3QodCk7XG4gICAgcmV0dXJuIHAubGVuZ3RoID4gMSA/IHBbcC5sZW5ndGggLSAyXSA6IG51bGw7XG4gIH1cblxuICBjaGlsZHJlbih0OiBUKTogVFtdIHtcbiAgICBsZXQgbiA9IF9maW5kTm9kZSh0LCB0aGlzLl9yb290KTtcbiAgICByZXR1cm4gaXNQcmVzZW50KG4pID8gbi5jaGlsZHJlbi5tYXAodCA9PiB0LnZhbHVlKSA6IG51bGw7XG4gIH1cblxuICBmaXJzdENoaWxkKHQ6IFQpOiBUIHtcbiAgICBsZXQgbiA9IF9maW5kTm9kZSh0LCB0aGlzLl9yb290KTtcbiAgICByZXR1cm4gaXNQcmVzZW50KG4pICYmIG4uY2hpbGRyZW4ubGVuZ3RoID4gMCA/IG4uY2hpbGRyZW5bMF0udmFsdWUgOiBudWxsO1xuICB9XG5cbiAgcGF0aEZyb21Sb290KHQ6IFQpOiBUW10geyByZXR1cm4gX2ZpbmRQYXRoKHQsIHRoaXMuX3Jvb3QsIFtdKS5tYXAocyA9PiBzLnZhbHVlKTsgfVxuXG4gIGNvbnRhaW5zKHRyZWU6IFRyZWU8VD4pOiBib29sZWFuIHsgcmV0dXJuIF9jb250YWlucyh0aGlzLl9yb290LCB0cmVlLl9yb290KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgVXJsVHJlZSBleHRlbmRzIFRyZWU8VXJsU2VnbWVudD4ge1xuICBjb25zdHJ1Y3Rvcihyb290OiBUcmVlTm9kZTxVcmxTZWdtZW50PikgeyBzdXBlcihyb290KTsgfVxufVxuXG5leHBvcnQgY2xhc3MgUm91dGVUcmVlIGV4dGVuZHMgVHJlZTxSb3V0ZVNlZ21lbnQ+IHtcbiAgY29uc3RydWN0b3Iocm9vdDogVHJlZU5vZGU8Um91dGVTZWdtZW50PikgeyBzdXBlcihyb290KTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcm9vdE5vZGU8VD4odHJlZTogVHJlZTxUPik6IFRyZWVOb2RlPFQ+IHtcbiAgcmV0dXJuIHRyZWUuX3Jvb3Q7XG59XG5cbmZ1bmN0aW9uIF9maW5kTm9kZTxUPihleHBlY3RlZDogVCwgYzogVHJlZU5vZGU8VD4pOiBUcmVlTm9kZTxUPiB7XG4gIC8vIFRPRE86IHZzYXZraW4gcmVtb3ZlIGl0IG9uY2UgcmVjb2duaXplIGlzIGZpeGVkXG4gIGlmIChleHBlY3RlZCBpbnN0YW5jZW9mIFJvdXRlU2VnbWVudCAmJiBlcXVhbFNlZ21lbnRzKDxhbnk+ZXhwZWN0ZWQsIDxhbnk+Yy52YWx1ZSkpIHJldHVybiBjO1xuICBpZiAoZXhwZWN0ZWQgPT09IGMudmFsdWUpIHJldHVybiBjO1xuICBmb3IgKGxldCBjYyBvZiBjLmNoaWxkcmVuKSB7XG4gICAgbGV0IHIgPSBfZmluZE5vZGUoZXhwZWN0ZWQsIGNjKTtcbiAgICBpZiAoaXNQcmVzZW50KHIpKSByZXR1cm4gcjtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gX2ZpbmRQYXRoPFQ+KGV4cGVjdGVkOiBULCBjOiBUcmVlTm9kZTxUPiwgY29sbGVjdGVkOiBUcmVlTm9kZTxUPltdKTogVHJlZU5vZGU8VD5bXSB7XG4gIGNvbGxlY3RlZC5wdXNoKGMpO1xuXG4gIC8vIFRPRE86IHZzYXZraW4gcmVtb3ZlIGl0IG9uY2UgcmVjb2duaXplIGlzIGZpeGVkXG4gIGlmIChfZXF1YWxWYWx1ZXMoZXhwZWN0ZWQsIGMudmFsdWUpKSByZXR1cm4gY29sbGVjdGVkO1xuXG4gIGZvciAobGV0IGNjIG9mIGMuY2hpbGRyZW4pIHtcbiAgICBsZXQgciA9IF9maW5kUGF0aChleHBlY3RlZCwgY2MsIExpc3RXcmFwcGVyLmNsb25lKGNvbGxlY3RlZCkpO1xuICAgIGlmIChpc1ByZXNlbnQocikpIHJldHVybiByO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIF9jb250YWluczxUPih0cmVlOiBUcmVlTm9kZTxUPiwgc3VidHJlZTogVHJlZU5vZGU8VD4pOiBib29sZWFuIHtcbiAgaWYgKCFfZXF1YWxWYWx1ZXModHJlZS52YWx1ZSwgc3VidHJlZS52YWx1ZSkpIHJldHVybiBmYWxzZTtcblxuICBmb3IgKGxldCBzdWJ0cmVlTm9kZSBvZiBzdWJ0cmVlLmNoaWxkcmVuKSB7XG4gICAgbGV0IHMgPSB0cmVlLmNoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiBfZXF1YWxWYWx1ZXMoY2hpbGQudmFsdWUsIHN1YnRyZWVOb2RlLnZhbHVlKSk7XG4gICAgaWYgKHMubGVuZ3RoID09PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKCFfY29udGFpbnMoc1swXSwgc3VidHJlZU5vZGUpKSByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gX2VxdWFsVmFsdWVzKGE6IGFueSwgYjogYW55KTogYm9vbGVhbiB7XG4gIGlmIChhIGluc3RhbmNlb2YgUm91dGVTZWdtZW50KSByZXR1cm4gZXF1YWxTZWdtZW50cyg8YW55PmEsIDxhbnk+Yik7XG4gIGlmIChhIGluc3RhbmNlb2YgVXJsU2VnbWVudCkgcmV0dXJuIGVxdWFsVXJsU2VnbWVudHMoPGFueT5hLCA8YW55PmIpO1xuICByZXR1cm4gYSA9PT0gYjtcbn1cblxuZXhwb3J0IGNsYXNzIFRyZWVOb2RlPFQ+IHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBULCBwdWJsaWMgY2hpbGRyZW46IFRyZWVOb2RlPFQ+W10pIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBVcmxTZWdtZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIHNlZ21lbnQ6IGFueSwgcHVibGljIHBhcmFtZXRlcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICBwdWJsaWMgb3V0bGV0OiBzdHJpbmcpIHt9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBsZXQgb3V0bGV0UHJlZml4ID0gaXNCbGFuayh0aGlzLm91dGxldCkgPyBcIlwiIDogYCR7dGhpcy5vdXRsZXR9OmA7XG4gICAgbGV0IHNlZ21lbnRQcmVmaXggPSBpc0JsYW5rKHRoaXMuc2VnbWVudCkgPyBcIlwiIDogdGhpcy5zZWdtZW50O1xuICAgIHJldHVybiBgJHtvdXRsZXRQcmVmaXh9JHtzZWdtZW50UHJlZml4fSR7X3NlcmlhbGl6ZVBhcmFtcyh0aGlzLnBhcmFtZXRlcnMpfWA7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3NlcmlhbGl6ZVBhcmFtcyhwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KTogc3RyaW5nIHtcbiAgbGV0IHJlcyA9IFwiXCI7XG4gIGlmIChpc1ByZXNlbnQocGFyYW1zKSkge1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChwYXJhbXMsICh2LCBrKSA9PiByZXMgKz0gYDske2t9PSR7dn1gKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnQgY2xhc3MgUm91dGVTZWdtZW50IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdHlwZTogVHlwZTtcblxuICAvKiogQGludGVybmFsICovXG4gIF9jb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT47XG5cbiAgY29uc3RydWN0b3IocHVibGljIHVybFNlZ21lbnRzOiBVcmxTZWdtZW50W10sIHB1YmxpYyBwYXJhbWV0ZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgICAgICAgcHVibGljIG91dGxldDogc3RyaW5nLCB0eXBlOiBUeXBlLCBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4pIHtcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgICB0aGlzLl9jb21wb25lbnRGYWN0b3J5ID0gY29tcG9uZW50RmFjdG9yeTtcbiAgfVxuXG4gIGdldFBhcmFtKHBhcmFtOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5wYXJhbWV0ZXJzKSA/IHRoaXMucGFyYW1ldGVyc1twYXJhbV0gOiBudWxsO1xuICB9XG5cbiAgZ2V0IHR5cGUoKTogVHlwZSB7IHJldHVybiB0aGlzLl90eXBlOyB9XG5cbiAgZ2V0IHN0cmluZ2lmaWVkVXJsU2VnbWVudHMoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudXJsU2VnbWVudHMubWFwKHMgPT4gcy50b1N0cmluZygpKS5qb2luKFwiL1wiKTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplUm91dGVTZWdtZW50VHJlZSh0cmVlOiBSb3V0ZVRyZWUpOiBzdHJpbmcge1xuICByZXR1cm4gX3NlcmlhbGl6ZVJvdXRlU2VnbWVudFRyZWUodHJlZS5fcm9vdCk7XG59XG5cbmZ1bmN0aW9uIF9zZXJpYWxpemVSb3V0ZVNlZ21lbnRUcmVlKG5vZGU6IFRyZWVOb2RlPFJvdXRlU2VnbWVudD4pOiBzdHJpbmcge1xuICBsZXQgdiA9IG5vZGUudmFsdWU7XG4gIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4ubWFwKGMgPT4gX3NlcmlhbGl6ZVJvdXRlU2VnbWVudFRyZWUoYykpLmpvaW4oXCIsIFwiKTtcbiAgcmV0dXJuIGAke3Yub3V0bGV0fToke3Yuc3RyaW5naWZpZWRVcmxTZWdtZW50c30oJHtzdHJpbmdpZnkodi50eXBlKX0pIFske2NoaWxkcmVufV1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxTZWdtZW50cyhhOiBSb3V0ZVNlZ21lbnQsIGI6IFJvdXRlU2VnbWVudCk6IGJvb2xlYW4ge1xuICBpZiAoaXNCbGFuayhhKSAmJiAhaXNCbGFuayhiKSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoIWlzQmxhbmsoYSkgJiYgaXNCbGFuayhiKSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoYS5fdHlwZSAhPT0gYi5fdHlwZSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoYS5vdXRsZXQgIT0gYi5vdXRsZXQpIHJldHVybiBmYWxzZTtcbiAgaWYgKGlzQmxhbmsoYS5wYXJhbWV0ZXJzKSAmJiAhaXNCbGFuayhiLnBhcmFtZXRlcnMpKSByZXR1cm4gZmFsc2U7XG4gIGlmICghaXNCbGFuayhhLnBhcmFtZXRlcnMpICYmIGlzQmxhbmsoYi5wYXJhbWV0ZXJzKSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoaXNCbGFuayhhLnBhcmFtZXRlcnMpICYmIGlzQmxhbmsoYi5wYXJhbWV0ZXJzKSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBTdHJpbmdNYXBXcmFwcGVyLmVxdWFscyhhLnBhcmFtZXRlcnMsIGIucGFyYW1ldGVycyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbFVybFNlZ21lbnRzKGE6IFVybFNlZ21lbnQsIGI6IFVybFNlZ21lbnQpOiBib29sZWFuIHtcbiAgaWYgKGlzQmxhbmsoYSkgJiYgIWlzQmxhbmsoYikpIHJldHVybiBmYWxzZTtcbiAgaWYgKCFpc0JsYW5rKGEpICYmIGlzQmxhbmsoYikpIHJldHVybiBmYWxzZTtcbiAgaWYgKGEuc2VnbWVudCAhPSBiLnNlZ21lbnQpIHJldHVybiBmYWxzZTtcbiAgaWYgKGEub3V0bGV0ICE9IGIub3V0bGV0KSByZXR1cm4gZmFsc2U7XG4gIGlmIChpc0JsYW5rKGEucGFyYW1ldGVycykgJiYgIWlzQmxhbmsoYi5wYXJhbWV0ZXJzKSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoIWlzQmxhbmsoYS5wYXJhbWV0ZXJzKSAmJiBpc0JsYW5rKGIucGFyYW1ldGVycykpIHJldHVybiBmYWxzZTtcbiAgaWYgKGlzQmxhbmsoYS5wYXJhbWV0ZXJzKSAmJiBpc0JsYW5rKGIucGFyYW1ldGVycykpIHJldHVybiB0cnVlO1xuICByZXR1cm4gU3RyaW5nTWFwV3JhcHBlci5lcXVhbHMoYS5wYXJhbWV0ZXJzLCBiLnBhcmFtZXRlcnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm91dGVTZWdtZW50Q29tcG9uZW50RmFjdG9yeShhOiBSb3V0ZVNlZ21lbnQpOiBDb21wb25lbnRGYWN0b3J5PGFueT4ge1xuICByZXR1cm4gYS5fY29tcG9uZW50RmFjdG9yeTtcbn0iXX0=