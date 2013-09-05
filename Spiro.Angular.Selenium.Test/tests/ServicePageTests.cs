// Copyright © Naked Objects Group Ltd ( http://www.nakedobjects.net). 
// All Rights Reserved. This code released under the terms of the 
// Microsoft Public License (MS-PL) ( http://opensource.org/licenses/ms-pl.html) 

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
            actions[0].Click();

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