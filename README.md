# 🛒 Myntra Product Scraper for WooCommerce

A lightweight, browser-based JavaScript tool that lets you scrape products from Myntra (titles, prices, images, sizes, descriptions) and export them directly into a WooCommerce-compatible CSV file.

## 🚀 Features

* Scrapes:

  * Product title
  * Price (rounded to nearest hundred)
  * Product images (up to 4)
  * Sizes (available variants)
  * Description
  * Categories (customizable)
* Bypasses:

  * Lazy-loaded images
  * Mouseover-based image sliders
* Generates:

  * Clean **CSV file** (upload-ready for WooCommerce)
  * **JSON-style object** for further use
* Runs **directly in the browser's Console**, no setup needed

## 🧠 Why This?

Myntra has one of the most JavaScript-heavy UIs with DOM manipulation on hover events. This tool mimics those interactions and **scrapes the content safely and reliably**.

Whether you're prototyping, populating an eCommerce demo site, or building automation tools — this saves hours of manual work.

---

## ⚙️ How To Use

1. Open the Myntra category page (e.g., Furniture, Shirts, etc.)
2. Open **DevTools → Console**
3. Paste the script
4. Modify the following before running:

   * `ID` → Start from last WooCommerce product ID (or any large number)
   * `totalPages` → Number of pages to loop through
   * `category` → e.g., "Furniture,Organisers"
   * `filename` → e.g., "myntra\_furniture.csv"
5. Press Enter
6. Wait... CSV download will start automatically!

---

## 📁 Output Example

CSV with columns:

```
ID, Type, Name, Price, Description, Short Description, Images, Categories, In stock?, Parent, Attribute 1 name, Attribute 1 value(s)
```

---

## 💡 Use Cases

* Populate WooCommerce product catalogs
* Analyze Myntra product data
* Bulk product import for MVP eCommerce sites
* Create JSON datasets for automation/testing

---

## 📸 Thumbnail for Sharing
<img width="1427" height="782" alt="image" src="https://github.com/user-attachments/assets/e046af6f-6ab2-4e72-8be7-2952457dcb65" />


---

## 🛠️ Tech Stack

* JavaScript (vanilla)
* Runs in-browser
* No dependencies

---

## 🤝 Contribute

Pull requests welcome — feel free to suggest improvements, add features like brand filtering, category auto-detection, etc.

---

## ⚠️ Disclaimer

This script is for **educational and learning purposes**. Always respect the terms of service of any website. Avoid commercial misuse.

---

## 📬 Connect With Me

Built by \Sidharth Goud – I love Development using js , php ,  api , automation, and WordPress.

Let’s connect: https://in.linkedin.com/in/sidharth-goud

---

## 📌 Tags

`#JavaScript` `#WebScraping` `#WooCommerce` `#WordPress` `#eCommerce` `#SideProject` `#OpenSource` `#Automation`
