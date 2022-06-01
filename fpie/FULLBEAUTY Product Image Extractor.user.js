// ==UserScript==
// @name         FULLBEAUTY Product Image Extractor
// @namespace    https://github.com/Abbydon/tm_userscripts/
// @website      https://github.com/Abbydon/tm_userscripts/
// @version      1.01
// @description  Provides options in the breadcrumb for viewing and saving the full-sized product image from all 12 FULLBEAUTY Brands sites.
// @author       Chris Fannin
// @copyright    GNU GPLv3
// @updateURL    https://github.com/Abbydon/tm_userscripts/blob/main/fpie/FULLBEAUTY%20Product%20Image%20Extractor.meta.js
// @downloadURL  https://github.com/Abbydon/tm_userscripts/blob/main/fpie/FULLBEAUTY%20Product%20Image%20Extractor.user.js
// @match        https://www.roamans.com/products/*
// @match        https://www.onestopplus.com/products/*
// @match        https://www.womanwithin.com/products/*
// @match        https://www.catherines.com/products/*
// @match        https://www.jessicalondon.com/products/*
// @match        https://www.ellos.us/products/*
// @match        https://www.intimatesforall.com/products/*
// @match        https://www.shoesforall.com/products/*
// @match        https://www.swimsuitsforall.com/products/*
// @match        https://www.brylanehome.com/products/*
// @match        https://www.kingsize.com/products/*
// @match        https://www.fullbeauty.com/products/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fullbeauty.com
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addElement
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_openInTab
// @grant        GM_download
// @run-at       document-end
// ==/UserScript==

waitForKeyElements (
    ".primaryZoomContainer",
    fpie_extractProductImage
);

function fpie_extractProductImage(jNode) {
    if (!jNode)
    {
        alert('FPIE: Unable to find element match.');
    } else
    {
        if (jNode.is("div"))
        {
            GM_unregisterMenuCommand('Open Product Image In New Tab');
            GM_unregisterMenuCommand('Download Product Image');
            //
            var styles = getComputedStyle(jNode[0].firstChild);
            var bgImage = styles.backgroundImage;
            if (!bgImage)
            {
                console.error('FPIE: Background image was not found.');
            }
            else
            {
                // -- Change this variable depending on if you want the raw GM_info data displayed in the info box
                // -- '1' = Show debug; otherwise don't show
                GM_setValue('fpie_showDebug', '0');
                /*
                -----------------
                -- SCRIPT INFO --
                -----------------
                */
                GM_setValue('fpie_profileName', 'FULLBEAUTY Brands');
                GM_setValue('fpie_profileLink', 'https://www.fbbrands.com/company-profile/');
                GM_setValue('fpie_siteSlogan', '12 Brands 1 Easy Checkout');
                GM_setValue('fpie_siteList', 'fullbeauty Outlet, Roaman\'s, OneStopPlus, Woman Within, Catherines, Jessica London, Ellos, Intimates For All, Shoes For All, Swimsuits For All, Brylane Home, King Size');
                /*
                -------------------------
                -- EXTRACT INFORMATION --
                -------------------------
                */
                var fpie_sitePrefix = {
                    'www.roamans.com' : 'rm',
                    'www.onestopplus.com' : 'osp',
                    'www.womanwithin.com' : 'ww',
                    'www.catherines.com' : 'cathy',
                    'www.jessicalondon.com' : 'jl',
                    'www.ellos.us' : 'ellos',
                    'www.intimatesforall.com' : 'ifa',
                    'www.shoesforall.com' : 'shfa',
                    'www.swimsuitsforall.com' : 'swfa',
                    'www.brylanehome.com' : 'bh',
                    'www.kingsize.com' : 'ks',
                    'www.fullbeauty.com' : 'fb'
                };
                // Example: https://cdn-fsly.yottaa.net/5a709960312e580ef3c50b6b/www.roamans.com/v~4b.66f/dw/image/v2/BBKT_PRD/on/demandware.static/-/Sites-masterCatalog_JessicaLondon/default/dw8a35d9ef/images/hi-res/2349_54386_mc_0013.jpg
                var fpie_imageUrl = styles.getPropertyValue('background-image').slice(4, -1).replace(/"/g, "");
                GM_setValue('fpie_imageUrl', fpie_imageUrl);
                // Example URL: https://www.roamans.com/products/classic-cotton-denim-straight-jeans/1010351.html?cgid=RM_Clearance_Jeans_%26_Pants&dwvar_1010351_color=4398930
                let fpie_urlObj = new URL(window.location.href);
                var fpie_pathParts = fpie_urlObj.pathname.split('/');
                var fpie_partCount = fpie_pathParts.length;
                // From Example: 1010351
                var fpie_prodNum = fpie_pathParts[fpie_partCount - 1].substring(0, fpie_pathParts[fpie_partCount - 1].indexOf('.') - 1);
                GM_setValue('fpie_prodNum', fpie_prodNum);
                // From Example: classic-cotton-denim-straight-jeans
                var fpie_prodName = fpie_pathParts[fpie_partCount - 2];
                GM_setValue('fpie_prodName', fpie_prodName);
                var fpie_prodColor = fpie_getProductColor(fpie_urlObj);
                GM_setValue('fpie_prodColor', fpie_prodColor);
                //
                var fpie_prodPrefix = fpie_sitePrefix[fpie_urlObj.hostname];
                // From Example: rm-classic-cotton-denim-straight-jeans-1010351-C4398930.jpg
                var fpie_prodFile = fpie_prodPrefix + '-' + fpie_prodName + '-' + fpie_prodNum + fpie_prodColor + '.jpg';
                GM_setValue('fpie_prodFile', fpie_prodFile);
                /*
                -- REGISTER MENU COMMANDS --
                */
                GM_registerMenuCommand('Open Product Image In New Tab', fpie_openImageTab);
                GM_registerMenuCommand('Download Product Image', fpie_downloadImage);
                /*
                ------------------
                -- CREATE LINKS --
                ------------------
                */
                var breadCrumb = $('ol.breadcrumb');
                if (!breadCrumb)
                {
                    console.info('FPIE: Unable to find breadcrumb.');
                }
                else
                {
                    var rpieLink = $('#fpie_links');
                    if (rpieLink)
                    {
                        rpieLink.remove();
                    }
                    /*
                    -- Link Text
                    */
                    var linkDesc = 'Open Product Image in a New Tab';
                    var linkText = ' ↗️ ';
                    var dlDesc = 'Download Product Image';
                    var dlText = ' 💾 ';
                    var infoDesc = 'About FPIE UserScript';
                    var infoText = ' ℹ️ ';
                    /*
                    -- Parent List Item Element
                    */
                    var liNode = document.createElement('li');
                    liNode.id = 'fpie_links';
                    liNode.className = 'breadcrumb-item';
                    liNode.style.setProperty('font-weight', 'bolder');
                    /*
                    -- Link: Open Image
                    */
                    var aNode = document.createElement('a');
                    var aText = document.createTextNode(linkText);
                    aNode.href = '#';
                    aNode.appendChild(aText);
                    aNode.className = 'fpie_link';
                    aNode.setAttribute('title', linkDesc);
                    /*
                    -- Link: Download Image
                    */
                    var aNode2 = document.createElement('a');
                    var aText2 = document.createTextNode(dlText);
                    aNode2.href = '#';
                    aNode2.appendChild(aText2);
                    aNode2.className = 'fpie_link';
                    aNode2.setAttribute('title', dlDesc);
                    /*
                    -- Link: Script Info
                    */
                    var aNode3 = document.createElement('a');
                    var aText3 = document.createTextNode(infoText);
                    aNode3.id = 'fpie_infoLink';
                    aNode3.style.visibility = 'hidden';
                    aNode3.href = '#';
                    aNode3.appendChild(aText3);
                    aNode3.className = 'fpie_link';
                    aNode3.setAttribute('title', infoDesc);
                    /*
                    -- Add links to LI, LI to breadcrumb
                    */
                    liNode.appendChild(aNode);
                    liNode.appendChild(aNode2);
                    liNode.appendChild(aNode3);
                    breadCrumb.append(liNode);
                    /*
                    -- Attach link click handlers
                    */
                    aNode.addEventListener('click', fpie_openTabLink, false);
                    aNode2.addEventListener('click', fpie_downloadLink, false);
                    aNode3.addEventListener('click', fpie_scriptLink, false);
                    //
                    fpie_addStyle();
                    fpie_scriptInfo();
                    fpie_attachCloseEvent();
                }
            }
        }
    }
};

function fpie_getProductColor(pUrl) {
    var pColor = '';
    if (pUrl && pUrl.searchParams)
    {
        for(let [name, value] of pUrl.searchParams)
        {
            if (name.endsWith('color'))
            {
                pColor = '-C' + value;
                break;
            }
        }
    }
    return pColor;
}

function fpie_openTabLink(e) {
    e.preventDefault();
    e.stopPropagation();
    //
    fpie_openImageTab();
}

function fpie_openImageTab() {
    var tabOptions = {
        active: true,
        insert: true,
        setParent: true
    };
    GM_openInTab(GM_getValue('fpie_imageUrl'), tabOptions);
}

function fpie_downloadLink(e) {
    e.preventDefault();
    e.stopPropagation();
    //
    fpie_downloadImage();
}

function fpie_downloadImage() {
    var dlDetails = {
        url: GM_getValue('fpie_imageUrl'),
        name: GM_getValue('fpie_prodFile'),
        saveAs: true,
        onerror: fpie_downloadError
    }
    GM_download(dlDetails);
}

function fpie_downloadError(e) {
    var nTitle = GM_info.script.name + ' v' + GM_info.script.version;
    var nText = 'Image Download Failed\n\n' + e.error;
    if (e.details)
    {
        nText += ': ' + e.Details;
    }
    GM_notification(nText, nTitle, null, null);
}

function fpie_addStyle() {
    //
    if ($('#fpie_styles'))
    {
        $('#fpie_styles').remove();
    }
    //
    var eStyle = document.createElement('style');
    eStyle.id = 'fpie_styles';
    var styleInfo = '.fpie_link {' +
        'background-color: rgb(224,224,224);' +
        'padding: 4px 16px;' +
        'border: 1px solid #c0c0c0;' +
        'border-radius: 6px;' +
        'margin-left: 1em;' +
        'text-align: center;' +
        'width: 64px;' +
        '}' +
        '.fpie_link:hover {' +
        'text-decoration: none;' +
        'background-color: rgb(255,245,188);' +
        '}';
    styleInfo += '#fpie_infoModal {' +
        'background-color: rgba(128, 128, 128, 0.5);' +
        'visibility: hidden;' +
        'position: absolute;' +
        'left: 0; top: 0;' +
        'width: 100%; height: 100%;' +
        'z-index: 1000;' +
        '}';
    styleInfo += '#fpie_infoInner {' +
        'width: 600px;' +
        'height: 400px;' +
        'margin: auto;' +
        'background-color: #f2f2f2;' +
        'border-radius: 10px;' +
        'padding: 0px;' +
        'border: 2px solid rgb(160,160,160);' +
        'position: absolute;' +
        'left: 400px;' +
        'top: 200px;' +
        'box-shadow: 0px 0px 1px 1px #c0c0c0;' +
        '}';
    styleInfo += '#fpie_infoTitle {' +
        'background-color: rgb(255,245,188);' +
        'border-bottom: 1px solid #c0c0c0;' +
        'border-radius: 10px 10px 0px 0px;' +
        'width: 100%;' +
        'padding: 8px;' +
        'font-weight: bolder;' +
        'font-size: 15px;' +
        'text-align: center;' +
        '}';
    styleInfo += '#fpie_infoClose {' +
        'float: right;' +
        'background-color: rgb(224,224,224);' +
        'border: 1px solid #c0c0c0;' +
        'border-radius: 3px;' +
        'margin-right: 4px;' +
        'padding: 1px 6px;' +
        'cursor: pointer;' +
        '}';
    styleInfo += '.fpie_infoBody {' +
        'width: 588px;' +
        'height: 315px;' +
        'margin: auto 4px;' +
        'padding: 10px;' +
        'overflow-x: hidden;' +
        'overflow-y: auto;' +
        '}';
    styleInfo += '#fpie_infoBox {' +
        '}';
    styleInfo += '.fpie_infoCols {' +
        'vertical-align: top;' +
        '}';
    styleInfo += '.fpie_infoCols::after {' +
        'content: "";' +
        'clear: both;' +
        'display: table;' +
        'margin-bottom: 16px;' +
        '}';
    styleInfo += '.fpie_infoCol1 {' +
        //'width: 274px;' +
        'width: 40%;' +
        'margin: 0;' +
        'padding-right: 4px;' +
        'vertical-align: top;' +
        'text-align: left;' +
        'display: inline;' +
        'float: left;' +
        '}';
    styleInfo += '.fpie_infoCol2 {' +
        //'width: 274px;' +
        'width: 60%;' +
        'margin: 0;' +
        'vertical-align: top;' +
        'text-align: left;' +
        'display: inline;' +
        'float: right;' +
        '}';
    styleInfo += '.fpie_infoLabel {' +
        'font-weight: bolder;' +
        '}';
    styleInfo += '.fpie_infoText {' +
        '}';
    styleInfo += '.fpie_infoLink {' +
        '}';
    styleInfo += '.fpie_infoDesc {' +
        'text-align: center;' +
        'font-variant: small-caps;' +
        'padding-bottom: 10px;' +
        'border-color: #c0c0c0;' +
        'border-style: none none double none;' +
        '}';
    styleInfo += '.fpie_infoTabs {' +
        'margin: 4px 4px 0px 4px;' +
        'padding: 0px;' +
        'border-bottom: 1px solid #c0c0c0;' +
        '}';
    styleInfo += '.fpie_tabLink {' +
        'display: inline-block;' +
        'padding: 2px 8px;' +
        'margin-right: 2px;' +
        'margin-bottom: 0px;' +
        'background-color: rgb(224,224,224);' +
        'border: 1px solid #c0c0c0;' +
        'border-bottom: 0px;' +
        'border-radius: 4px 4px 0px 0px;' +
        'width: 96px;' +
        'text-align: center;' +
        '}';
    styleInfo += '.fpie_tabLinkSel {' +
        'display: inline-block;' +
        'padding: 2px 8px;' +
        'margin-right: 2px;' +
        'margin-bottom: 0px;' +
        'background-color: rgb(255,245,188);' +
        'border: 1px solid #c0c0c0;' +
        'border-bottom: 0px;' +
        'border-radius: 4px 4px 0px 0px;' +
        'width: 96px;' +
        'text-align: center;' +
        '}';
    styleInfo += '.fpie_infoDebug {' +
        'margin-top: 0px;' +
        'width: 558px;' +
        'font-size: 0.8em;' +
        'font-family: "Lucida Console", "Courier New", monospace;' +
        'white-space: pre;' +
        'overflow-x: auto;' +
        'border-style: inset;' +
        '}';
    eStyle.innerText = styleInfo;
    document.head.appendChild(eStyle);
}

function fpie_addTextNode(node, text) {
    if (node)
    {
        var textNode = document.createTextNode(text);
        node.appendChild(textNode);
    }
}

function fpie_addBreakNode(node, cssClass) {
    if (node)
    {
        var brNode = document.createElement('br');
        if (cssClass) brNode.className = cssClass;
        node.appendChild(brNode);
    }
}

function fpie_addSpanNode(node, text, cssClass) {
    if (node)
    {
        var spanNode = document.createElement('span');
        fpie_addTextNode(spanNode, text ? text : '(empty)');
        if (cssClass) spanNode.className = cssClass;
        node.appendChild(spanNode);
    }
}

function fpie_addLinkNode(node, text, cssClass, url) {
    if (node)
    {
        var aNode = document.createElement('a');
        fpie_addTextNode(aNode, text ? text : '(empty)');
        if (url) {
            aNode.href = url;
            aNode.target = '_blank';
        }
        if (cssClass) aNode.className = cssClass;
        node.appendChild(aNode);
    }
}

function fpie_addInfoRow(node, label, detail, url) {
    if (node)
    {
        fpie_addSpanNode(node, label + ': ', 'fpie_infoLabel');
        if (url && url.length > 0)
        {
            var spanNode = document.createElement('span');
            spanNode.className = 'fpie_infoText';
            fpie_addLinkNode(spanNode, detail, 'fpie_infoLink', url);
            node.appendChild(spanNode);
        } else
        {
            fpie_addSpanNode(node, detail, 'fpie_infoText');
        }
        fpie_addBreakNode(node);
    }
}

function fpie_attachCloseEvent() {
    if ('onvisibilitychange' in document)
    {
        GM_setValue('fpie_clearStorage', 'visibilitychange');
        document.addEventListener('visibilitychange', fpie_clearStorage, false);
    } else if ('onpagehide' in window)
    {
        GM_setValue('fpie_clearStorage', 'pagehide');
        window.addEventListener('pagehide', fpie_clearStorage, false);
    } else
    {
        GM_setValue('fpie_clearStorage', 'NOT FOUND');
        console.info('FPIE: Unable to find window event needed.');
    }
}

function fpie_clearStorage(e) {

    if (GM_getValue('fpie_clearStorage', 'visibilitychange'))
    {
        GM_setValue('fpie_visibility', document.visibilityState);
        if (document.visibilityState == 'visible')
        {
            return;
        }
    }
    // -- Purge all storage values
    var names = GM_listValues();
    for (var i=0; i < names.length; i++)
    {
        GM_deleteValue(names[i]);
    }
}

function fpie_scriptLink(e) {
    e.preventDefault();
    e.stopPropagation();
    //
    var el = document.getElementById('fpie_infoModal');
    el.style.visibility = (el.style.visibility == 'visible') ? 'hidden' : 'visible';
}

function fpie_toggleInfo(toShow) {
    if (toShow)
    {
        var infoVisible = (toShow == 'info');
        var debugVisible = (toShow == 'debug');
        var divInfo = document.getElementById('fpie_infoBody');
        divInfo.style.display = infoVisible ? 'block' : 'none';
        var divDebug = document.getElementById('fpie_infoDebug');
        divDebug.style.display = debugVisible ? 'block' : 'none';
    }
}

function fpie_toggleTabs(e) {
    e.preventDefault();
    e.stopPropagation();
    //
    var tabName = e.currentTarget.dataset.fpieTab;
    if (tabName)
    {
        var activeInfo = (tabName == 'info');
        var activeDebug = (tabName == 'debug');
        //
        var aInfo = document.getElementById('fpie_tabInfo');
        aInfo.className = activeInfo ? 'fpie_tabLinkSel' : 'fpie_tabLink';
        //
        var aDebug = document.getElementById('fpie_tabDebug');
        aDebug.className = activeDebug ? 'fpie_tabLinkSel' : 'fpie_tabLink';
        //
        fpie_toggleInfo(tabName);
    }
}

function fpie_scriptInfo() {
    if ($('#fbie_infoModal'))
    {
        $('#fbie_infoModal').remove();
    }
    /*
    -- RENDER THE ENTIRE INFORMATION DIALOG
    */
    // MAIN MODAL
    var divModal = document.createElement('div');
    divModal.id = 'fpie_infoModal';
    // INNER PANEL
    var divInner = document.createElement('div');
    divInner.id = 'fpie_infoInner';
    divModal.appendChild(divInner);
    // TITLE
    var divTitle = document.createElement('div');
    divTitle.id = 'fpie_infoTitle';
    fpie_addTextNode(divTitle, GM_info.script.name + ' v' + GM_info.script.version);
    var aClose = document.createElement('a');
    fpie_addTextNode(aClose, 'X');
    aClose.id = 'fpie_infoClose';
    aClose.setAttribute('title', 'Close');
    divTitle.appendChild(aClose);
    divInner.appendChild(divTitle);
    // CONTENT
    var divBody = document.createElement('div');
    divBody.id = 'fpie_infoBody';
    divBody.className = 'fpie_infoBody';
    // DEBUG
    var divDebug;
    if (GM_getValue('fpie_showDebug', '0') == '1')
    {
        var divTabs = document.createElement('div');
        divTabs.id = 'fpie_infoTabs';
        divTabs.className = 'fpie_infoTabs';
        //
        var tabInfo = document.createElement('a');
        tabInfo.id = 'fpie_tabInfo';
        tabInfo.href = '#';
        tabInfo.className = 'fpie_tabLinkSel';
        tabInfo.dataset.fpieTab = 'info';
        fpie_addTextNode(tabInfo, 'Info');
        divTabs.appendChild(tabInfo);
        //
        var tabDebug = document.createElement('a');
        tabDebug.id = 'fpie_tabDebug';
        tabDebug.href = '#';
        tabDebug.className = 'fpie_tabLink';
        tabDebug.dataset.fpieTab = 'debug';
        fpie_addTextNode(tabDebug, 'Debug');
        divTabs.appendChild(tabDebug);
        //
        divInner.appendChild(divTabs);
        //
        divDebug = document.createElement('div');
        divDebug.id = 'fpie_infoDebug';
        divDebug.className = 'fpie_infoBody';
        divDebug.style.display = 'none';
        //
        tabInfo.addEventListener('click', fpie_toggleTabs, false);
        tabDebug.addEventListener('click', fpie_toggleTabs, false);
    }
    // CONTENT: SCRIPT DETAILS
    var infoDetails = document.createElement('div');
    infoDetails.className = 'fpie_infoBox';
    // -- Script Description
    var infoDesc = document.createElement('p');
    infoDesc.className = 'fpie_infoDesc';
    fpie_addTextNode(infoDesc, GM_info.script.description);
    infoDetails.appendChild(infoDesc);
    // -- Detail Columns
    var infoCols = document.createElement('div');
    infoCols.className = 'fpie_infoCols';
    var infoCol1 = document.createElement('div');
    infoCol1.className = 'fpie_infoCol1';
    var infoCol2 = document.createElement('div');
    infoCol2.className = 'fpie_infoCol2';
    infoCols.appendChild(infoCol1);
    infoCols.appendChild(infoCol2);
    infoDetails.appendChild(infoCols);
    // -- Column Content
    fpie_addInfoRow(infoCol1, 'Author', GM_info.script.author, GM_info.script.namespace);
    if (GM_info.script.homepage)
    {
        fpie_addInfoRow(infoCol1, 'Website', '[ Visit ]', GM_info.script.homepage);
    }
    fpie_addInfoRow(infoCol2, 'Last Modified', new Date(GM_info.script.lastModified).toLocaleString());
    fpie_addInfoRow(infoCol2, 'Copyright', GM_info.script.copyright);
    // CONTENT: STORE WEBSITE INFO
    var storeInfo = document.createElement('div');
    storeInfo.id = 'fpie_storeInfo';
    var spanStore = document.createElement('span');
    spanStore.className = 'fpie_infoLabel';
    fpie_addLinkNode(spanStore, GM_getValue('fpie_profileName', '(missing store name)'), 'fpie_infoLink', GM_getValue('fpie_profileLink', ''));
    storeInfo.appendChild(spanStore);
    fpie_addSpanNode(storeInfo, ': ' + GM_getValue('fpie_siteSlogan', '(missing slogan)'), 'fpie_infoText');
    fpie_addBreakNode(storeInfo);
    fpie_addBreakNode(storeInfo);
    fpie_addSpanNode(storeInfo, GM_getValue('fpie_siteList', '(missing store list)'));
    infoDetails.appendChild(storeInfo)
    divBody.appendChild(infoDetails);
    // CONTENT: DEBUG
    if (GM_getValue('fpie_showDebug', '0') == '1')
    {
        divBody.style.marginTop = '0px';
        var debugInfo = document.createElement('div');
        debugInfo.className = 'fpie_infoDebug';
        fpie_addTextNode(debugInfo, JSON.stringify(GM_info, fpie_jsonReplacer, 3));
        divDebug.appendChild(debugInfo);
        divInner.appendChild(divDebug);
    }
    divInner.appendChild(divBody);
    //
    $('body').append(divModal);
    var posLeft = ((($(window).width() - divInner.offsetWidth) / 2) + $(window).scrollLeft() + "px");
    divInner.style.setProperty('left', posLeft, 'important');
    aClose.addEventListener('click', fpie_scriptLink, false);
    var el = document.getElementById('fpie_infoLink');
    el.style.visibility = 'visible';

}
function fpie_jsonReplacer(key, value) {
  if (typeof value === 'string') {
    return value.replace(/\n/g, '\n');
  }
  return value;
}