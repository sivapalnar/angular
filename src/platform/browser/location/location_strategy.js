'use strict';"use strict";
var core_1 = require('angular2/core');
/**
 * `LocationStrategy` is responsible for representing and reading route state
 * from the browser's URL. Angular provides two strategies:
 * {@link HashLocationStrategy} and {@link PathLocationStrategy} (default).
 *
 * This is used under the hood of the {@link Location} service.
 *
 * Applications should use the {@link Router} or {@link Location} services to
 * interact with application route state.
 *
 * For instance, {@link HashLocationStrategy} produces URLs like
 * `http://example.com#/foo`, and {@link PathLocationStrategy} produces
 * `http://example.com/foo` as an equivalent URL.
 *
 * See these two classes for more.
 */
var LocationStrategy = (function () {
    function LocationStrategy() {
    }
    return LocationStrategy;
}());
exports.LocationStrategy = LocationStrategy;
/**
 * The `APP_BASE_HREF` token represents the base href to be used with the
 * {@link PathLocationStrategy}.
 *
 * If you're using {@link PathLocationStrategy}, you must provide a provider to a string
 * representing the URL prefix that should be preserved when generating and recognizing
 * URLs.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 * import {APP_BASE_HREF} from 'angular2/platform/common';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [
 *   ROUTER_PROVIDERS,
 *   provide(APP_BASE_HREF, {useValue: '/my/app'})
 * ]);
 * ```
 */
exports.APP_BASE_HREF = new core_1.OpaqueToken('appBaseHref');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLTEyR1QzUEp2LnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci9sb2NhdGlvbi9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQTBCLGVBQWUsQ0FBQyxDQUFBO0FBRzFDOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNIO0lBQUE7SUFTQSxDQUFDO0lBQUQsdUJBQUM7QUFBRCxDQUFDLEFBVEQsSUFTQztBQVRxQix3QkFBZ0IsbUJBU3JDLENBQUE7QUFHRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNVLHFCQUFhLEdBQW1DLElBQUksa0JBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7T3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtVcmxDaGFuZ2VMaXN0ZW5lcn0gZnJvbSAnLi9wbGF0Zm9ybV9sb2NhdGlvbic7XG5cbi8qKlxuICogYExvY2F0aW9uU3RyYXRlZ3lgIGlzIHJlc3BvbnNpYmxlIGZvciByZXByZXNlbnRpbmcgYW5kIHJlYWRpbmcgcm91dGUgc3RhdGVcbiAqIGZyb20gdGhlIGJyb3dzZXIncyBVUkwuIEFuZ3VsYXIgcHJvdmlkZXMgdHdvIHN0cmF0ZWdpZXM6XG4gKiB7QGxpbmsgSGFzaExvY2F0aW9uU3RyYXRlZ3l9IGFuZCB7QGxpbmsgUGF0aExvY2F0aW9uU3RyYXRlZ3l9IChkZWZhdWx0KS5cbiAqXG4gKiBUaGlzIGlzIHVzZWQgdW5kZXIgdGhlIGhvb2Qgb2YgdGhlIHtAbGluayBMb2NhdGlvbn0gc2VydmljZS5cbiAqXG4gKiBBcHBsaWNhdGlvbnMgc2hvdWxkIHVzZSB0aGUge0BsaW5rIFJvdXRlcn0gb3Ige0BsaW5rIExvY2F0aW9ufSBzZXJ2aWNlcyB0b1xuICogaW50ZXJhY3Qgd2l0aCBhcHBsaWNhdGlvbiByb3V0ZSBzdGF0ZS5cbiAqXG4gKiBGb3IgaW5zdGFuY2UsIHtAbGluayBIYXNoTG9jYXRpb25TdHJhdGVneX0gcHJvZHVjZXMgVVJMcyBsaWtlXG4gKiBgaHR0cDovL2V4YW1wbGUuY29tIy9mb29gLCBhbmQge0BsaW5rIFBhdGhMb2NhdGlvblN0cmF0ZWd5fSBwcm9kdWNlc1xuICogYGh0dHA6Ly9leGFtcGxlLmNvbS9mb29gIGFzIGFuIGVxdWl2YWxlbnQgVVJMLlxuICpcbiAqIFNlZSB0aGVzZSB0d28gY2xhc3NlcyBmb3IgbW9yZS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBhYnN0cmFjdCBwYXRoKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgcHJlcGFyZUV4dGVybmFsVXJsKGludGVybmFsOiBzdHJpbmcpOiBzdHJpbmc7XG4gIGFic3RyYWN0IHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IGZvcndhcmQoKTogdm9pZDtcbiAgYWJzdHJhY3QgYmFjaygpOiB2b2lkO1xuICBhYnN0cmFjdCBvblBvcFN0YXRlKGZuOiBVcmxDaGFuZ2VMaXN0ZW5lcik6IHZvaWQ7XG4gIGFic3RyYWN0IGdldEJhc2VIcmVmKCk6IHN0cmluZztcbn1cblxuXG4vKipcbiAqIFRoZSBgQVBQX0JBU0VfSFJFRmAgdG9rZW4gcmVwcmVzZW50cyB0aGUgYmFzZSBocmVmIHRvIGJlIHVzZWQgd2l0aCB0aGVcbiAqIHtAbGluayBQYXRoTG9jYXRpb25TdHJhdGVneX0uXG4gKlxuICogSWYgeW91J3JlIHVzaW5nIHtAbGluayBQYXRoTG9jYXRpb25TdHJhdGVneX0sIHlvdSBtdXN0IHByb3ZpZGUgYSBwcm92aWRlciB0byBhIHN0cmluZ1xuICogcmVwcmVzZW50aW5nIHRoZSBVUkwgcHJlZml4IHRoYXQgc2hvdWxkIGJlIHByZXNlcnZlZCB3aGVuIGdlbmVyYXRpbmcgYW5kIHJlY29nbml6aW5nXG4gKiBVUkxzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge1JPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqIGltcG9ydCB7QVBQX0JBU0VfSFJFRn0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vY29tbW9uJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1xuICogICBST1VURVJfUFJPVklERVJTLFxuICogICBwcm92aWRlKEFQUF9CQVNFX0hSRUYsIHt1c2VWYWx1ZTogJy9teS9hcHAnfSlcbiAqIF0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBBUFBfQkFTRV9IUkVGOiBPcGFxdWVUb2tlbiA9IC8qQHRzMmRhcnRfY29uc3QqLyBuZXcgT3BhcXVlVG9rZW4oJ2FwcEJhc2VIcmVmJyk7XG4iXX0=