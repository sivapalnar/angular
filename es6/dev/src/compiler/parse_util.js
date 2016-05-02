export class ParseLocation {
    constructor(file, offset, line, col) {
        this.file = file;
        this.offset = offset;
        this.line = line;
        this.col = col;
    }
    toString() { return `${this.file.url}@${this.line}:${this.col}`; }
}
export class ParseSourceFile {
    constructor(content, url) {
        this.content = content;
        this.url = url;
    }
}
export class ParseSourceSpan {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    toString() {
        return this.start.file.content.substring(this.start.offset, this.end.offset);
    }
}
export var ParseErrorLevel;
(function (ParseErrorLevel) {
    ParseErrorLevel[ParseErrorLevel["WARNING"] = 0] = "WARNING";
    ParseErrorLevel[ParseErrorLevel["FATAL"] = 1] = "FATAL";
})(ParseErrorLevel || (ParseErrorLevel = {}));
export class ParseError {
    constructor(span, msg, level = ParseErrorLevel.FATAL) {
        this.span = span;
        this.msg = msg;
        this.level = level;
    }
    toString() {
        var source = this.span.start.file.content;
        var ctxStart = this.span.start.offset;
        if (ctxStart > source.length - 1) {
            ctxStart = source.length - 1;
        }
        var ctxEnd = ctxStart;
        var ctxLen = 0;
        var ctxLines = 0;
        while (ctxLen < 100 && ctxStart > 0) {
            ctxStart--;
            ctxLen++;
            if (source[ctxStart] == "\n") {
                if (++ctxLines == 3) {
                    break;
                }
            }
        }
        ctxLen = 0;
        ctxLines = 0;
        while (ctxLen < 100 && ctxEnd < source.length - 1) {
            ctxEnd++;
            ctxLen++;
            if (source[ctxEnd] == "\n") {
                if (++ctxLines == 3) {
                    break;
                }
            }
        }
        let context = source.substring(ctxStart, this.span.start.offset) + '[ERROR ->]' +
            source.substring(this.span.start.offset, ctxEnd + 1);
        return `${this.msg} ("${context}"): ${this.span.start}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VfdXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVjc3a2FFcEcudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9wYXJzZV91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBQ0UsWUFBbUIsSUFBcUIsRUFBUyxNQUFjLEVBQVMsSUFBWSxFQUNqRSxHQUFXO1FBRFgsU0FBSSxHQUFKLElBQUksQ0FBaUI7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNqRSxRQUFHLEdBQUgsR0FBRyxDQUFRO0lBQUcsQ0FBQztJQUVsQyxRQUFRLEtBQWEsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVFLENBQUM7QUFFRDtJQUNFLFlBQW1CLE9BQWUsRUFBUyxHQUFXO1FBQW5DLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFRO0lBQUcsQ0FBQztBQUM1RCxDQUFDO0FBRUQ7SUFDRSxZQUFtQixLQUFvQixFQUFTLEdBQWtCO1FBQS9DLFVBQUssR0FBTCxLQUFLLENBQWU7UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFlO0lBQUcsQ0FBQztJQUV0RSxRQUFRO1FBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvRSxDQUFDO0FBQ0gsQ0FBQztBQUVELFdBQVksZUFHWDtBQUhELFdBQVksZUFBZTtJQUN6QiwyREFBTyxDQUFBO0lBQ1AsdURBQUssQ0FBQTtBQUNQLENBQUMsRUFIVyxlQUFlLEtBQWYsZUFBZSxRQUcxQjtBQUVEO0lBQ0UsWUFBbUIsSUFBcUIsRUFBUyxHQUFXLEVBQ3pDLEtBQUssR0FBb0IsZUFBZSxDQUFDLEtBQUs7UUFEOUMsU0FBSSxHQUFKLElBQUksQ0FBaUI7UUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFRO1FBQ3pDLFVBQUssR0FBTCxLQUFLLENBQXlDO0lBQUcsQ0FBQztJQUVyRSxRQUFRO1FBQ04sSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUMxQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDdEMsRUFBRSxDQUFDLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUNELElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQztRQUN0QixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFFakIsT0FBTyxNQUFNLEdBQUcsR0FBRyxJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNwQyxRQUFRLEVBQUUsQ0FBQztZQUNYLE1BQU0sRUFBRSxDQUFDO1lBQ1QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLEtBQUssQ0FBQztnQkFDUixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNiLE9BQU8sTUFBTSxHQUFHLEdBQUcsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNsRCxNQUFNLEVBQUUsQ0FBQztZQUNULE1BQU0sRUFBRSxDQUFDO1lBQ1QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLEtBQUssQ0FBQztnQkFDUixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFFRCxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZO1lBQ2pFLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVuRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxNQUFNLE9BQU8sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzFELENBQUM7QUFDSCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgUGFyc2VMb2NhdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBmaWxlOiBQYXJzZVNvdXJjZUZpbGUsIHB1YmxpYyBvZmZzZXQ6IG51bWJlciwgcHVibGljIGxpbmU6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIGNvbDogbnVtYmVyKSB7fVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgJHt0aGlzLmZpbGUudXJsfUAke3RoaXMubGluZX06JHt0aGlzLmNvbH1gOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZVNvdXJjZUZpbGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udGVudDogc3RyaW5nLCBwdWJsaWMgdXJsOiBzdHJpbmcpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZVNvdXJjZVNwYW4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RhcnQ6IFBhcnNlTG9jYXRpb24sIHB1YmxpYyBlbmQ6IFBhcnNlTG9jYXRpb24pIHt9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zdGFydC5maWxlLmNvbnRlbnQuc3Vic3RyaW5nKHRoaXMuc3RhcnQub2Zmc2V0LCB0aGlzLmVuZC5vZmZzZXQpO1xuICB9XG59XG5cbmV4cG9ydCBlbnVtIFBhcnNlRXJyb3JMZXZlbCB7XG4gIFdBUk5JTkcsXG4gIEZBVEFMXG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQYXJzZUVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIG1zZzogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgbGV2ZWw6IFBhcnNlRXJyb3JMZXZlbCA9IFBhcnNlRXJyb3JMZXZlbC5GQVRBTCkge31cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHZhciBzb3VyY2UgPSB0aGlzLnNwYW4uc3RhcnQuZmlsZS5jb250ZW50O1xuICAgIHZhciBjdHhTdGFydCA9IHRoaXMuc3Bhbi5zdGFydC5vZmZzZXQ7XG4gICAgaWYgKGN0eFN0YXJ0ID4gc291cmNlLmxlbmd0aCAtIDEpIHtcbiAgICAgIGN0eFN0YXJ0ID0gc291cmNlLmxlbmd0aCAtIDE7XG4gICAgfVxuICAgIHZhciBjdHhFbmQgPSBjdHhTdGFydDtcbiAgICB2YXIgY3R4TGVuID0gMDtcbiAgICB2YXIgY3R4TGluZXMgPSAwO1xuXG4gICAgd2hpbGUgKGN0eExlbiA8IDEwMCAmJiBjdHhTdGFydCA+IDApIHtcbiAgICAgIGN0eFN0YXJ0LS07XG4gICAgICBjdHhMZW4rKztcbiAgICAgIGlmIChzb3VyY2VbY3R4U3RhcnRdID09IFwiXFxuXCIpIHtcbiAgICAgICAgaWYgKCsrY3R4TGluZXMgPT0gMykge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY3R4TGVuID0gMDtcbiAgICBjdHhMaW5lcyA9IDA7XG4gICAgd2hpbGUgKGN0eExlbiA8IDEwMCAmJiBjdHhFbmQgPCBzb3VyY2UubGVuZ3RoIC0gMSkge1xuICAgICAgY3R4RW5kKys7XG4gICAgICBjdHhMZW4rKztcbiAgICAgIGlmIChzb3VyY2VbY3R4RW5kXSA9PSBcIlxcblwiKSB7XG4gICAgICAgIGlmICgrK2N0eExpbmVzID09IDMpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBjb250ZXh0ID0gc291cmNlLnN1YnN0cmluZyhjdHhTdGFydCwgdGhpcy5zcGFuLnN0YXJ0Lm9mZnNldCkgKyAnW0VSUk9SIC0+XScgK1xuICAgICAgICAgICAgICAgICAgc291cmNlLnN1YnN0cmluZyh0aGlzLnNwYW4uc3RhcnQub2Zmc2V0LCBjdHhFbmQgKyAxKTtcblxuICAgIHJldHVybiBgJHt0aGlzLm1zZ30gKFwiJHtjb250ZXh0fVwiKTogJHt0aGlzLnNwYW4uc3RhcnR9YDtcbiAgfVxufVxuIl19