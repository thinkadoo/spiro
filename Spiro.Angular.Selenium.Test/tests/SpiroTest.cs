// Copyright © Naked Objects Group Ltd ( http://www.nakedobjects.net). 
// All Rights Reserved. This code released under the terms of the 
// Microsoft Public License (MS-PL) ( http://opensource.org/licenses/ms-pl.html) 

using System;
using System.Collections.ObjectModel;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NakedObjects.Xat.Database;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.IE;
using OpenQA.Selenium.Support.UI;

namespace NakedObjects.Web.UnitTests.Selenium {
    [TestClass]
    public abstract class SpiroTest {
        #region overhead

        protected const string url = "http://mvc.nakedobjects.net:1081/UnitTestSpiroNg";
        protected const string server = @"Saturn\SqlExpress";
        protected const string database = "AdventureWorks";
        protected const string backup = "AdventureWorks";

        //protected const string url = "http://localhost:53103/";
        //protected const string server = @".\SQLEXPRESS";
        //protected const string database = "AdventureWorks";
        //protected const string backup = "AdventureWorksInitialState";

        protected IWebDriver br;
        protected WebDriverWait wait;

        [ClassInitialize]
        public static void InitialiseClass(TestContext context) {
            DatabaseUtils.RestoreDatabase(database, backup, server);
        }

        public virtual void CleanUpTest() {
            if (br != null) {
                try {
                    br.Manage().Cookies.DeleteAllCookies();
                    br.Quit();
                    br.Dispose();
                    br = null;
                }
                catch {
                    // to suppress error 
                }
            }
        }

        protected void InitFirefoxDriver() {
            br = new FirefoxDriver();
            wait = new WebDriverWait(br, TimeSpan.FromSeconds(10));
        }

        protected void InitIeDriver() {
            br = new InternetExplorerDriver();
            wait = new WebDriverWait(br, TimeSpan.FromSeconds(10));
        }

        protected void InitChromeDriver() {
            const string cacheDir = @"C:\SeleniumTestFolder";

            var crOptions = new ChromeOptions();
            crOptions.AddArgument(@"--user-data-dir=" + cacheDir);
            br = new ChromeDriver(crOptions);
            wait = new WebDriverWait(br, TimeSpan.FromSeconds(10));

            // test workaround for chromedriver problem https://groups.google.com/forum/#!topic/selenium-users/nJ0NF1UJ3WU
            Thread.Sleep(5000);
        }

        #endregion

        #region Helpers

        protected virtual void GoToServiceFromHomePage(string serviceName) {
            var wait = new WebDriverWait(br, TimeSpan.FromSeconds(10));

            wait.Until(d => d.FindElements(By.ClassName("service")).Count == 12);
            ReadOnlyCollection<IWebElement> services = br.FindElements(By.ClassName("service"));
            IWebElement service = services.FirstOrDefault(s => s.Text == serviceName);
            if (service != null) {
                service.Click();
                const string titleSelector = "div.object-view > div.header > div.title";
                wait.Until(d => !string.IsNullOrWhiteSpace(d.FindElement(By.CssSelector(titleSelector)).Text));
            }
            else {
                throw new ObjectNotFoundException(string.Format("service not found {0}", serviceName));
            }
        }

        protected void Login() {
            Thread.Sleep(2000);
        }

        #endregion

        #region chrome helper

        protected static string FilePath(string resourcename) {
            string fileName = resourcename.Remove(0, resourcename.IndexOf(".") + 1);

            string newFile = Path.Combine(Directory.GetCurrentDirectory(), fileName);

            if (File.Exists(newFile)) {
                File.Delete(newFile);
            }

            Assembly assembly = Assembly.GetExecutingAssembly();

            using (Stream stream = assembly.GetManifestResourceStream("Spiro.Angular.Selenium.Test." + resourcename)) {
                using (FileStream fileStream = File.Create(newFile, (int) stream.Length)) {
                    var bytesInStream = new byte[stream.Length];
                    stream.Read(bytesInStream, 0, bytesInStream.Length);
                    fileStream.Write(bytesInStream, 0, bytesInStream.Length);
                }
            }

            return newFile;
        }

        #endregion
    }
}