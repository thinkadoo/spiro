// Copyright © Naked Objects Group Ltd ( http://www.nakedobjects.net). 
// All Rights Reserved. This code released under the terms of the 
// Microsoft Public License (MS-PL) ( http://opensource.org/licenses/ms-pl.html) 

using System;
using System.Collections.ObjectModel;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.IE;
using OpenQA.Selenium.Support.UI;

namespace NakedObjects.Web.UnitTests.Selenium {
    public abstract class HomePageTests : SpiroTest {
        [TestMethod]
        public virtual void HomePage() {
            var wait = new WebDriverWait(br, TimeSpan.FromSeconds(10));
            bool found = wait.Until(d => d.FindElements(By.ClassName("service")).Count == 12);
            Assert.IsTrue(found, "Services not found on home page");
        }

        [TestMethod]
        public virtual void Services() {
            var wait = new WebDriverWait(br, TimeSpan.FromSeconds(10));

            wait.Until(d => d.FindElements(By.ClassName("service")).Count == 12);

            ReadOnlyCollection<IWebElement> services = br.FindElements(By.ClassName("service"));

            Assert.AreEqual("Customers", services[0].Text);
            Assert.AreEqual("Orders", services[1].Text);
            Assert.AreEqual("Products", services[2].Text);
            Assert.AreEqual("Employees", services[3].Text);
            Assert.AreEqual("Sales", services[4].Text);
            Assert.AreEqual("Special Offers", services[5].Text);
            Assert.AreEqual("Contacts", services[6].Text);
            Assert.AreEqual("Vendors", services[7].Text);
            Assert.AreEqual("Purchase Orders", services[8].Text);
            Assert.AreEqual("Work Orders", services[9].Text);
            Assert.AreEqual("Orders", services[10].Text);
            Assert.AreEqual("Customers", services[11].Text);
        }

        [TestMethod]
        public virtual void MenuBar() {
            var wait = new WebDriverWait(br, TimeSpan.FromSeconds(10));
            wait.Until(d => d.FindElements(By.ClassName("app-bar")).Count == 1);

            Assert.IsTrue(br.FindElement(By.ClassName("home")).Displayed);
            Assert.IsTrue(br.FindElement(By.ClassName("back")).Displayed);
            Assert.IsTrue(br.FindElement(By.ClassName("forward")).Displayed);
            Assert.IsFalse(br.FindElement(By.ClassName("refresh")).Displayed);
            Assert.IsFalse(br.FindElement(By.ClassName("edit")).Displayed);
            Assert.IsFalse(br.FindElement(By.ClassName("help")).Displayed);
        }

        [TestMethod, Ignore]
        public virtual void GoToService() {
            var wait = new WebDriverWait(br, TimeSpan.FromSeconds(10));

            wait.Until(d => d.FindElements(By.ClassName("service")).Count == 12);
            ReadOnlyCollection<IWebElement> services = br.FindElements(By.ClassName("service"));
            services[0].Click();
            wait.Until(d => d.FindElements(By.ClassName("object-view")).Count == 1);
            var title = wait.Until(d => d.FindElement(By.CssSelector(".header > .title")));
            Assert.AreEqual("Customers", title.Text );
        }

    }

    [TestClass]
    public class HomePageTestsIe : HomePageTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.IEDriverServer.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            br = new InternetExplorerDriver();
            br.Navigate().GoToUrl(url);
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    [TestClass]
    public class HomePageTestsFirefox : HomePageTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            br = new FirefoxDriver();
            br.Navigate().GoToUrl(url);
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }

    [TestClass]
    public class HomePageTestsChrome : HomePageTests {
        [ClassInitialize]
        public new static void InitialiseClass(TestContext context) {
            FilePath(@"drivers.chromedriver.exe");
            SpiroTest.InitialiseClass(context);
        }

        [TestInitialize]
        public virtual void InitializeTest() {
            br = InitChromeDriver();
            br.Navigate().GoToUrl(url);
        }

        [TestCleanup]
        public virtual void CleanupTest() {
            base.CleanUpTest();
        }
    }
}