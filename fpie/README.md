# FULLBEAUTY Product Image Extractor (FPIE)

Provides options in the breadcrumb as well as the [TamperMonkey](https://www.tampermonkey.net/) menu for viewing and saving the full-sized product image from all 12 [FULLBEAUTY Brands](https://www.fbbrands.com/company-profile/) sites: _fullbeauty Outlet, Roaman's, OneStopPlus, Woman Within, Catherines, Jessica London, Ellos, Intimates For All, Shoes For All, Swimsuits For All, Brylane Home, and King Size_.

The intended usage is to save images for a local wishlist or other reference.

## Table of Contents

- [FULLBEAUTY Product Image Extractor (FPIE)](#fullbeauty-product-image-extractor-fpie)
  - [Table of Contents](#table-of-contents)
  - [Breadcrumb Buttons](#breadcrumb-buttons)
  - [Menu Options](#menu-options)
  - [Options](#options)
    - [Open Product Image in a New Tab](#open-product-image-in-a-new-tab)
    - [Download Product Image](#download-product-image)
    - [About FPIE UserScript](#about-fpie-userscript)
  - [Future](#future)

## Breadcrumb Buttons

When a product is viewed, the link buttons appear in the breadcrumb above the product image. Each of the buttons have ALT text for hover tips.

![Breadcrumb options](https://github.com/Abbydon/tm_userscripts/blob/main/fpie/fpie_breadcrumb.png?raw=true)

## Menu Options

Two menu options are also added to the TamperMonkey extension menu and context menu.

![TamperMonkey menu](https://github.com/Abbydon/tm_userscripts/blob/main/fpie/fpie_tm_menu.png?raw=true)

## Options

The first two options are available in both the breadcrumb and the TM menu. The third (Info) is only in the breadcrumb.

### Open Product Image in a New Tab

The raw image URL is opened in a new tab for easy viewing of the entire image, and it can be manually saved like any other image.

### Download Product Image

A "Save As" dialog with the name is presented with an editable custom filename to allow you to choose a location to save the image. The filename is generated using information from the URL.

Example URL for the breakdown: `https://www.roamans.com/products/classic-cotton-denim-straight-jeans/1010351.html?dwvar_1010351_color=4398930`

* **Store Prefix**: The prefixes are defined within the script itself. They are up to 5 letters depending on the store. The script looks up which one is being visited and fetches it from the list. Example: Roaman's = `rm`.
* **Product Name**: The name is retrieved from the product page URL. It immediately follows the "/products/" part of the path. Example: `classic-cotton-denim-straight-jeans`
* **Product Number**: The product number is retrieved from the last part of the path from the page name. Example: `1010351`
* **Color**: The color is searched for in the query string. If a name is found ending with "__color_", it is assumed to be the code. It is then prefixed with "_C_". Example: `C4398930`

The end result: `rm-classic-cotton-denim-straight-jeans-1010351-C4398930.jpg`

The purpose of this naming convention is to distinguish product image files from each other in an ordered, sortable fashion (Store, Name, Number, Color) while remaining readable with the product name.

### About FPIE UserScript

The information icon in the breadcrumb displays a modal panel containing information about the script. Actual contents may differ depending on script revisions.

![FPIE UserScript Info Dialog](https://github.com/Abbydon/tm_userscripts/blob/main/fpie/fpie_info.png?raw=true)

**Debug Version**

The dialog can also be configured to show "debug" information by changing the following value within the script.

```js
// -- Change this variable depending on if you want the raw GM_info data displayed in the info box
// -- '1' = Show debug; otherwise don't show
GM_setValue('fpie_showDebug', '0');
```

If this is done, then tabs are displayed to allow toggling between the two panels. Version 1.01 of the dialog shows the `GM_info` data for the script.

![FPIE UserScript Info Dialog with Debug](https://github.com/Abbydon/tm_userscripts/blob/main/fpie/fpie_info_debug.png?raw=true)

## Future 

Future development plans can be found [in the wiki](https://github.com/Abbydon/tm_userscripts/wiki). Issues and enhancements can be entered into the [Issues](https://github.com/Abbydon/tm_userscripts/issues) section. Make sure to provide as much detail as possible.