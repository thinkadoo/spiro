var Spiro;
(function (Spiro) {
    /// <reference path="spiro.angular.app.ts" />
    (function (Angular) {
        Angular.app.config(function ($provide) {
            $provide.decorator("$exceptionHandler", function (Logger) {
                return Logger;
            });
        });

        // TODO enhance logging to log to server
        Angular.app.service('Logger', function ($log, $window) {
            function log(exception, cause) {
                $log.error.apply($log, arguments);

                try  {
                    var errorMessage = exception.toString();

                    //var stackTrace = stacktraceService.print({ e: exception });
                    $.ajax({
                        type: "POST",
                        url: "./javascript-errors",
                        contentType: "application/json",
                        data: angular.toJson({
                            errorUrl: $window.location.href,
                            errorMessage: errorMessage,
                            stackTrace: "",
                            cause: (cause || "")
                        })
                    });
                } catch (loggingError) {
                    $log.warn("Error logging failed");
                    $log.log(loggingError);
                }
            }
            return log;
        });
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.angular.services.logging.js.map
