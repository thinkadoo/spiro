// Copyright © Naked Objects Group Ltd ( http://www.nakedobjects.net). 
// All Rights Reserved. This code released under the terms of the 
// Microsoft Public License (MS-PL) ( http://opensource.org/licenses/ms-pl.html) 

using System;
using System.Collections.ObjectModel;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;

namespace NakedObjects.Web.UnitTests.Selenium {
    [TestClass]
    public abstract class ServicePageTests : SpiroTest {
        [TestMethod]
        public virtual void MenuBar() {
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
            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 11);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            Assert.AreEqual("Find Customer By Account Number", actions[0].Text);
            Assert.AreEqual("Customer Dashboard", actions[1].Text);
            Assert.AreEqual("Throw Domain Exception", actions[2].Text);
            Assert.AreEqual("Find Individual Customer By Name", actions[3].Text);
            Assert.AreEqual("Create New Individual Customer", actions[4].Text);
            Assert.AreEqual("Random Individual", actions[5].Text);
            Assert.AreEqual("Query Individuals", actions[6].Text);
            Assert.AreEqual("Find Store By Name", actions[7].Text);
            Assert.AreEqual("Create New Store Customer", actions[8].Text);
            Assert.AreEqual("Random Store", actions[9].Text);
            Assert.AreEqual("Query Stores", actions[10].Text);
        }

        [TestMethod]
        public virtual void DialogAction() {
            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 11);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            // click on action to open dialog 
            actions[0].Click(); // Find customer by account number

            wait.Until(d => d.FindElement(By.ClassName("action-dialog")));
            string title = br.FindElement(By.CssSelector("div.action-dialog > div.title")).Text;

            Assert.AreEqual("Find Customer By Account Number", title);

            // cancel dialog 
            br.FindElement(By.CssSelector("div.action-dialog  .cancel")).Click();

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
            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 11);
        

            var showObject = new Action(() => {
                // click on action to open dialog 
                br.FindElements(By.ClassName("action"))[0].Click(); // Find customer by account number

                wait.Until(d => d.FindElement(By.ClassName("action-dialog")));
                string title = br.FindElement(By.CssSelector("div.action-dialog > div.title")).Text;

                Assert.AreEqual("Find Customer By Account Number", title);

                br.FindElement(By.CssSelector(".parameter-value > input")).SendKeys("AW00022262");

                br.FindElement(By.ClassName("show")).Click();

                wait.Until(d => d.FindElement(By.ClassName("nested-object")));
            });

            var cancelObject = new Action(() => {
                // cancel object 
                br.FindElement(By.CssSelector("div.nested-object .cancel")).Click();

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

            var cancelDialog = new Action(() => {
                br.FindElement(By.CssSelector("div.action-dialog  .cancel")).Click();

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
            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 11);


            // click on action to open dialog 
            br.FindElements(By.ClassName("action"))[0].Click(); // Find customer by account number

            wait.Until(d => d.FindElement(By.ClassName("action-dialog")));
            string title = br.FindElement(By.CssSelector("div.action-dialog > div.title")).Text;

            Assert.AreEqual("Find Customer By Account Number", title);

            br.FindElement(By.CssSelector(".parameter-value > input")).SendKeys("AW00022262");

            br.FindElement(By.ClassName("go")).Click();

            wait.Until(d => d.FindElement(By.ClassName("nested-object")));

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
            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 11);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            // click on action to get object 
            actions[9].Click(); // random store 

            wait.Until(d => d.FindElement(By.ClassName("nested-object")));

            // cancel object 
            br.FindElement(By.CssSelector("div.nested-object .cancel")).Click();

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
            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 11);
         
            // click on action to get object 
            br.FindElements(By.ClassName("action"))[9].Click(); // random store 

            wait.Until(d => d.FindElement(By.ClassName("nested-object")));

            // expand object
            br.FindElement(By.CssSelector("div.nested-object .expand")).Click();

            wait.Until(d => br.FindElement(By.ClassName("object-properties")));
        }

        [TestMethod]
        public virtual void CollectionAction() {
            br.Navigate().GoToUrl(url);
            GoToServiceFromHomePage("Orders");

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 6);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            // click on action to get object 
            actions[2].Click(); // highest value orders

            wait.Until(d => d.FindElement(By.ClassName("list-view")));

            // cancel collection 
            br.FindElement(By.CssSelector("div.list-view .cancel")).Click();

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
            br.Navigate().GoToUrl(url);
            GoToServiceFromHomePage("Orders");

            var selectItem = new Action(() => {
                wait.Until(d => d.FindElements(By.ClassName("action")).Count == 6);
                ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

                // click on action to get object 
                actions[2].Click(); // highest value orders

                wait.Until(d => d.FindElement(By.ClassName("list-view")));

                // select item
                br.FindElement(By.CssSelector("div.list-item")).Click();

                wait.Until(d => br.FindElement(By.ClassName("nested-object")));
            });

            // cancel object 

            var cancelObject = new Action(() => {
                br.FindElement(By.CssSelector("div.nested-object .cancel")).Click();
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
                br.FindElement(By.CssSelector("div.list-view .cancel")).Click();

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
            br.Navigate().GoToUrl(url);
            GoToServiceFromHomePage("Orders");

            wait.Until(d => d.FindElements(By.ClassName("action")).Count == 6);
            ReadOnlyCollection<IWebElement> actions = br.FindElements(By.ClassName("action"));

            // click on action to get object 
            actions[2].Click(); // highest value orders

            wait.Until(d => d.FindElement(By.ClassName("list-view")));

            // select item
            br.FindElement(By.CssSelector("div.list-item")).Click();

            wait.Until(d => br.FindElement(By.ClassName("nested-object")));

            // expand object
            br.FindElement(By.CssSelector("div.nested-object .expand")).Click();

            wait.Until(d => br.FindElement(By.ClassName("object-properties")));
        }


    }

    #region browsers specific subclasses

    [TestClass]
    public class ServicePageTestsIe : ServicePageTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.IEDriverServer.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitIeDriver();
            br.Navigate().GoToUrl(url);
            GoToServiceFromHomePage("Customers");
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    [TestClass]
    public class ServicePageTestsFirefox : ServicePageTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitFirefoxDriver();
            br.Navigate().GoToUrl(url);
            GoToServiceFromHomePage("Customers");
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    [TestClass]
    public class ServicePageTestsChrome : ServicePageTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.chromedriver.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            InitChromeDriver();

            br.Navigate().GoToUrl(url);
            GoToServiceFromHomePage("Customers");
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    #endregion
}