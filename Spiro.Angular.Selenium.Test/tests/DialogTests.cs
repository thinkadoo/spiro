// Copyright © Naked Objects Group Ltd ( http://www.nakedobjects.net). 
// All Rights Reserved. This code released under the terms of the 
// Microsoft Public License (MS-PL) ( http://opensource.org/licenses/ms-pl.html) 

using System;
using System.Collections.ObjectModel;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace NakedObjects.Web.UnitTests.Selenium {
    [TestClass]
    public abstract class DialogTests : SpiroTest {
       
        [TestMethod]
        public virtual void ChoicesParm() {
            br.Navigate().GoToUrl(orderServiceUrl);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 6);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            var showList = new Action<string, string>((type, test) => {
                // click on action to open dialog 
                Click(br.FindElements(By.ClassName("action"))[3]); // orders by value

                wait.Until(d => d.FindElement(By.ClassName("action-dialog")));
                string title = br.FindElement(By.CssSelector("div.action-dialog > div.title")).Text;

                Assert.AreEqual("Orders By Value", title);

                br.FindElement(By.CssSelector(".parameter-value  select")).SendKeys(type);

                Click(br.FindElement(By.ClassName("show")));

                wait.Until(d => d.FindElement(By.ClassName("list-view")));

                string topItem = br.FindElement(By.CssSelector("div.list-item > a")).Text;

                Assert.AreEqual(test, topItem);
            });

            var cancelList = new Action(() => {
                // cancel object 
                Click(br.FindElement(By.CssSelector("div.list-view .cancel")));

                wait.Until(d => {
                    try {
                        br.FindElement(By.ClassName("list-view"));
                        return false;
                    }
                    catch (NoSuchElementException) {
                        return true;
                    }
                });
            });

            var cancelDialog = new Action(() => {
                Click(br.FindElement(By.CssSelector("div.action-dialog  .cancel")));

                wait.Until(d => {
                    try {
                        br.FindElement(By.ClassName("action-dialog"));
                        return false;
                    }
                    catch (NoSuchElementException) {
                        return true;
                    }
                });
            });

            showList("Ascending", "SO51782");
            cancelList();
            cancelDialog();

            showList("Descending", "SO55282");
            cancelDialog();
            cancelList();
        }

      
    }

    #region browsers specific subclasses

    [TestClass, Ignore]
    public class DialogTestsIe : DialogTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.IEDriverServer.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitIeDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    [TestClass]
    public class DialogTestsFirefox : DialogTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitFirefoxDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    [TestClass, Ignore]
    public class DialogTestsChrome : DialogTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.chromedriver.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitChromeDriver();
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }

        protected override void ScrollTo(IWebElement element) {
            string script = string.Format("window.scrollTo({0}, {1});return true;", element.Location.X, element.Location.Y);
            ((IJavaScriptExecutor) br).ExecuteScript(script);
        }
    }

    #endregion
}