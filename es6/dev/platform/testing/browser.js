import { TEST_BROWSER_STATIC_PLATFORM_PROVIDERS, ADDITIONAL_TEST_BROWSER_PROVIDERS } from 'angular2/platform/testing/browser_static';
import { BROWSER_APP_PROVIDERS } from 'angular2/platform/browser';
/**
 * Providers for using template cache to avoid actual XHR.
 * Re-exported here so that tests import from a single place.
 */
export { CACHED_TEMPLATE_PROVIDER } from 'angular2/platform/browser';
/**
 * Default platform providers for testing.
 */
export const TEST_BROWSER_PLATFORM_PROVIDERS = 
/*@ts2dart_const*/ [TEST_BROWSER_STATIC_PLATFORM_PROVIDERS];
/**
 * Default application providers for testing.
 */
export const TEST_BROWSER_APPLICATION_PROVIDERS = 
/*@ts2dart_const*/ [BROWSER_APP_PROVIDERS, ADDITIONAL_TEST_BROWSER_PROVIDERS];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVjc3a2FFcEcudG1wL2FuZ3VsYXIyL3BsYXRmb3JtL3Rlc3RpbmcvYnJvd3Nlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUNMLHNDQUFzQyxFQUN0QyxpQ0FBaUMsRUFDbEMsTUFBTSwwQ0FBMEM7T0FDMUMsRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQjtBQUUvRDs7O0dBR0c7QUFDSCxTQUFRLHdCQUF3QixRQUFPLDJCQUEyQixDQUFDO0FBRW5FOztHQUVHO0FBQ0gsT0FBTyxNQUFNLCtCQUErQjtBQUN4QyxrQkFBa0IsQ0FBQSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFFL0Q7O0dBRUc7QUFDSCxPQUFPLE1BQU0sa0NBQWtDO0FBQzNDLGtCQUFrQixDQUFBLENBQUMscUJBQXFCLEVBQUUsaUNBQWlDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIFRFU1RfQlJPV1NFUl9TVEFUSUNfUExBVEZPUk1fUFJPVklERVJTLFxuICBBRERJVElPTkFMX1RFU1RfQlJPV1NFUl9QUk9WSURFUlNcbn0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vdGVzdGluZy9icm93c2VyX3N0YXRpYyc7XG5pbXBvcnQge0JST1dTRVJfQVBQX1BST1ZJREVSU30gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5cbi8qKlxuICogUHJvdmlkZXJzIGZvciB1c2luZyB0ZW1wbGF0ZSBjYWNoZSB0byBhdm9pZCBhY3R1YWwgWEhSLlxuICogUmUtZXhwb3J0ZWQgaGVyZSBzbyB0aGF0IHRlc3RzIGltcG9ydCBmcm9tIGEgc2luZ2xlIHBsYWNlLlxuICovXG5leHBvcnQge0NBQ0hFRF9URU1QTEFURV9QUk9WSURFUn0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5cbi8qKlxuICogRGVmYXVsdCBwbGF0Zm9ybSBwcm92aWRlcnMgZm9yIHRlc3RpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBURVNUX0JST1dTRVJfUExBVEZPUk1fUFJPVklERVJTOiBBcnJheTxhbnkgLypUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXSovPiA9XG4gICAgLypAdHMyZGFydF9jb25zdCovW1RFU1RfQlJPV1NFUl9TVEFUSUNfUExBVEZPUk1fUFJPVklERVJTXTtcblxuLyoqXG4gKiBEZWZhdWx0IGFwcGxpY2F0aW9uIHByb3ZpZGVycyBmb3IgdGVzdGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IFRFU1RfQlJPV1NFUl9BUFBMSUNBVElPTl9QUk9WSURFUlM6IEFycmF5PGFueSAvKlR5cGUgfCBQcm92aWRlciB8IGFueVtdKi8+ID1cbiAgICAvKkB0czJkYXJ0X2NvbnN0Ki9bQlJPV1NFUl9BUFBfUFJPVklERVJTLCBBRERJVElPTkFMX1RFU1RfQlJPV1NFUl9QUk9WSURFUlNdO1xuIl19