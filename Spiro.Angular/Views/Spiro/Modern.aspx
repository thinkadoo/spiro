<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<!DOCTYPE html>

<html ng-app="app">
<head id="Head1" runat="server">
    <meta name="viewport" content="width=device-width" />
    <title>Spiro</title>

    <link href="~/Content/spiro-modern.css" rel="stylesheet" type="text/css" />
    <link href="~/Content/themes/base/jquery.ui.datepicker.css" rel="stylesheet" type="text/css" />
    <link href="~/Content/themes/base/jquery.ui.theme.css" rel="stylesheet" type="text/css" />
    <link href="~/Content/themes/base/jquery.ui.core.css" rel="stylesheet" type="text/css" />
    
</head>

<body style="cursor: auto;" class="spiro" >

  
    <div id="main" ng-view ng-controller="BackgroundController" ng-class="backgroundColor" ></div>

    <script type="text/javascript">
        var appPath = "http://mvc.nakedobjects.net:1081/RestDemo";
        var svrPath = "<%=Url.Content("~")%>";
    </script>

<%--    Color definitions & Mappings.  Here you may specifiy the color(s) for any object type in your model.  Where a
    type is not specified in this map, Spiro will assign a color to that type, arbitrarily but consistently --%>
    <script type="text/javascript">
        var colorMap = {
            "AdventureWorksModel.CustomerRepository": "redLight",
            "AdventureWorksModel.Store": "red",
            "AdventureWorksModel.Individual": "red",
            "AdventureWorksModel.OrderRepository": "green",
            "AdventureWorksModel.SalesOrderHeader": "greenDark",
            "AdventureWorksModel.SalesOrderDetail": "green",
            "AdventureWorksModel.ProductRepository": "orange",
            "AdventureWorksModel.Product": "orangeDark",
            "AdventureWorksModel.ProductInventory": "orange",
            "AdventureWorksModel.ProductReview": "orange",
            "AdventureWorksModel.ProductModel": "yellow",
            "AdventureWorksModel.ProductCategory": "redLight",
            "AdventureWorksModel.ProductSubCategory": "red",
            "AdventureWorksModel.EmployeeRepository": "blue",
            "AdventureWorksModel.Employee": "blueDark",
            "AdventureWorksModel.EmployeePayHistory": "blue",
            "AdventureWorksModel.EmployeeDepartmentHistory": "blue",
            "AdventureWorksModel.SalesRepository": "purple",
            "AdventureWorksModel.SalesPerson": "purple",
            "AdventureWorksModel.SpecialOfferRepository": "pink",
            "AdventureWorksModel.SpecialOffer": "pinkDark",
            "AdventureWorksModel.ContactRepository": "teal",
            "AdventureWorksModel.Contact": "teal",
            "AdventureWorksModel.VendorRepository": "greenDark",
            "AdventureWorksModel.Vendor": "greenDark",
            "AdventureWorksModel.PurchaseOrderRepository": "grayDark",
            "AdventureWorksModel.PurchaseOrder": "grayDark",
            "AdventureWorksModel.WorkOrderRepository": "orangeDark",
            "AdventureWorksModel.WorkOrder": "orangeDark",
            "AdventureWorksModel.OrderContributedActions": "darkBlue",
            "AdventureWorksModel.CustomerContributedActions": "darkBlue"
        };
        
        var defaultColorArray = [
           "blue", //0
           "blueLight", //1
           "blueDark", //2
           "green", //3
           "greenLight", //4
           "greenDark", //5
           "red", //6
           "yellow", //7
           "orange", //8
           "orange", //9
           "orangeDark", //10
           "pink", //11
           "pinkDark", //12
           "purple", //13
           "grayDark", //14
           "magenta", //15
           "teal", //16
           "redLight" //17
        ];

        var defaultColor = "darkBlue";
    </script>
    
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/underscore.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/modernizr-2.6.2.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/jquery-2.0.3.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/jquery-ui-1.10.3.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/angular.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/angular-resource.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.models.helpers.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.models.shims.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.models.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.angular.viewmodels.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.angular.app.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.angular.controllers.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.angular.directives.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.angular.services.representationloader.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.angular.services.viewmodelfactory.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.angular.services.urlhelper.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.angular.services.context.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.angular.services.handlers.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.angular.services.color.js") %>"></script>
    <script type="text/javascript" src="<%= Url.Content("~/Scripts/spiro.angular.services.logging.js") %>"></script>

</body>
</html>
