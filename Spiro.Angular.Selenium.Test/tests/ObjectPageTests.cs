// Copyright © Naked Objects Group Ltd ( http://www.nakedobjects.net). 
// All Rights Reserved. This code released under the terms of the 
// Microsoft Public License (MS-PL) ( http://opensource.org/licenses/ms-pl.html) 

using System;
using System.Collections.ObjectModel;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace NakedObjects.Web.UnitTests.Selenium {
    [TestClass]
    public abstract class ObjectPageTests : SpiroTest {
        [TestMethod]
        public virtual void MenuBar() {
            br.Navigate().GoToUrl(store555Url);

            wait.Until(d => d.FindElements(By.ClassName("app-bar")).Count == 1);

            Assert.IsTrue(br.FindElement(By.ClassName("home")).Displayed);
            Assert.IsTrue(br.FindElement(By.ClassName("back")).Displayed);
            Assert.IsTrue(br.FindElement(By.ClassName("forward")).Displayed);
            Assert.IsFalse(br.FindElement(By.ClassName("refresh")).Displayed);
            Assert.IsFalse(br.FindElement(By.ClassName("edit")).Displayed);
            Assert.IsFalse(br.FindElement(By.ClassName("help")).Displayed);
        }

        [TestMethod]
        public virtual void Actions() {
            br.Navigate().GoToUrl(store555Url);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 8);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            Assert.AreEqual("Create New Address", actions[0].Text);
            Assert.AreEqual("Create New Contact", actions[1].Text);
            Assert.AreEqual("Create New Order", actions[2].Text);
            Assert.AreEqual("Quick Order", actions[3].Text);
            Assert.AreEqual("Search For Orders", actions[4].Text);
            Assert.AreEqual("Last Order", actions[5].Text);
            Assert.AreEqual("Open Orders", actions[6].Text);
            Assert.AreEqual("Recent Orders", actions[7].Text);
        }

        [TestMethod]
        public virtual void DialogAction() {
            br.Navigate().GoToUrl(store555Url);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 8);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            // click on action to open dialog 
            Click(actions[4]); // Search For Orders

            wait.Until(d => d.FindElement(By.ClassName("action-dialog")));
            string title = br.FindElement(By.CssSelector("div.action-dialog > div.title")).Text;

            Assert.AreEqual("Search For Orders", title);

            // cancel dialog 
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
        }

        [TestMethod]
        public virtual void DialogActionShow() {
            br.Navigate().GoToUrl(store555Url);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 8);

            var showObject = new Action(() => {
                // click on action to open dialog 
                Click(br.FindElements(By.ClassName("action"))[4]); // Search for orders

                wait.Until(d => d.FindElement(By.ClassName("action-dialog")));
                string title = br.FindElement(By.CssSelector("div.action-dialog > div.title")).Text;

                Assert.AreEqual("Search For Orders", title);

                br.FindElements(By.CssSelector(".parameter-value > input"))[0].SendKeys("1/1/2003");
                br.FindElements(By.CssSelector(".parameter-value > input"))[1].SendKeys("1/12/2003");

                Click(br.FindElement(By.ClassName("show")));

                wait.Until(d => d.FindElement(By.ClassName("list-view")));
            });

            var cancelObject = new Action(() => {
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

            showObject();
            cancelObject();
            cancelDialog();

            showObject();
            cancelDialog();
            cancelObject();
        }

        [TestMethod]
        public virtual void DialogActionGo() {
            br.Navigate().GoToUrl(store555Url);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 8);

            // click on action to open dialog 
            Click(br.FindElements(By.ClassName("action"))[4]); // Fisearch for orders

            wait.Until(d => d.FindElement(By.ClassName("action-dialog")));
            string title = br.FindElement(By.CssSelector("div.action-dialog > div.title")).Text;

            Assert.AreEqual("Search For Orders", title);

            br.FindElements(By.CssSelector(".parameter-value > input"))[0].SendKeys("1/1/2003");
            br.FindElements(By.CssSelector(".parameter-value > input"))[1].SendKeys("1/12/2003");

            Maximize();

            Click(br.FindElement(By.ClassName("go")));

            wait.Until(d => d.FindElement(By.ClassName("list-view")));

            // dialog should be closed

            wait.Until(d => {
                try {
                    br.FindElement(By.ClassName("action-dialog"));
                    return false;
                }
                catch (NoSuchElementException) {
                    return true;
                }
            });
        }


        [TestMethod]
        public virtual void ObjectAction() {
            br.Navigate().GoToUrl(store555Url);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 8);

            IWebElement action = br.FindElements(By.ClassName("action"))[5];

            // click on action to get object 
            Click(action); // last order

            wait.Until(d => d.FindElement(By.ClassName("nested-object")));

            // cancel object 
            Click(br.FindElement(By.CssSelector("div.nested-object .cancel")));

            wait.Until(d => {
                try {
                    br.FindElement(By.ClassName("nested-object"));
                    return false;
                }
                catch (NoSuchElementException) {
                    return true;
                }
            });
        }

        [TestMethod]
        public virtual void ObjectActionExpand() {
            br.Navigate().GoToUrl(store555Url);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 8);
            IWebElement action = br.FindElements(By.ClassName("action"))[5];

            // click on action to get object 
            Click(action); //last order

            wait.Until(d => d.FindElement(By.ClassName("nested-object")));

            // expand object
            Click(br.FindElement(By.CssSelector("div.nested-object .expand")));

            wait.Until(d => br.FindElement(By.ClassName("object-properties")));
        }

        [TestMethod]
        public virtual void CollectionAction() {
            br.Navigate().GoToUrl(store555Url);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 8);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            // click on action to get collection 
            Click(actions[7]); // recent orders

            wait.Until(d => d.FindElement(By.ClassName("list-view")));

            // cancel collection 
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
        }

        [TestMethod]
        public virtual void CollectionActionSelectItem() {
            br.Navigate().GoToUrl(store555Url);

            var selectItem = new Action(() => {
                wait.Until(d => d.FindElements(By.ClassName("action")).Count == 8);
                ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

                // click on action to get object 
                Click(actions[7]); // recent orders

                wait.Until(d => d.FindElement(By.ClassName("list-view")));

                // select item
                Click(br.FindElement(By.CssSelector("div.list-item")));

                wait.Until(d => br.FindElement(By.ClassName("nested-object")));
            });

            // cancel object 

            var cancelObject = new Action(() => {
                Click(br.FindElement(By.CssSelector("div.nested-object .cancel")));
                wait.Until(d => {
                    try {
                        br.FindElement(By.ClassName("nested-object"));
                        return false;
                    }
                    catch (NoSuchElementException) {
                        return true;
                    }
                });
            });

            // cancel collection 
            var cancelCollection = new Action(() => {
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


            selectItem();
            cancelObject();
            cancelCollection();

            // repeat but first cancel collection 
            selectItem();
            cancelCollection();
            cancelObject();
        }

        [TestMethod]
        public virtual void CollectionActionSelectItemExpand() {
            br.Navigate().GoToUrl(store555Url);

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 8);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            // click on action to get object 
            Click(actions[7]); //recent orders

            wait.Until(d => d.FindElement(By.ClassName("list-view")));

            // select item
            Click(br.FindElement(By.CssSelector("div.list-item")));

            wait.Until(d => br.FindElement(By.ClassName("nested-object")));

            // expand object
            Click(br.FindElement(By.CssSelector("div.nested-object .expand")));

            wait.Until(d => br.FindElement(By.ClassName("object-properties")));
        }
    }

    #region browsers specific subclasses

    [TestClass]
    public class ObjectPageTestsIe : ObjectPageTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.IEDriverServer.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitIeDriver();
            br.Navigate().GoToUrl(url);
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    [TestClass]
    public class ObjectPageTestsFirefox : ObjectPageTests {
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

        protected override void ScrollTo(IWebElement element) {
            string script = string.Format("window.scrollTo({0}, {1});return true;", element.Location.X, element.Location.Y);
            ((IJavaScriptExecutor) br).ExecuteScript(script);
        }
    }

    [TestClass, Ignore]
    public class ObjectPageTestsChrome : ObjectPageTests {
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
    }

    #endregion
}