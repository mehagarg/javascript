// the function called from the shareLink.html (the shareLink.html is the CDN page where the Platform redirects)
// see: https://cloudon.atlassian.net/wiki/display/ARCH/Link+Sharing+and+File+Sharing+Flow+-+Click+On+Emailed+Link

function onLoad() {

  window.apiUrl = window.location.getParameter("apiUrl");
  window.linkType = window.location.getParameter("type");
  window.linkId = window.location.getParameter("linkId");
  var webappUrl = window.location.getParameter("webappUrl");

  if(!isMobile.any()) {
    if(!webappUrl) {
      webappUrl = "http://www.cloudon.com/app";
    }
    window.location =  webappUrl+
                        "#preview/" +
                        window.location.getParameter("uri") +
                        "/" +
                        window.location.getParameter("filename"); 

    return;
  }

  // supported Mobile client
  if (isMobile.iOS()) {
  
    // if the app is not installed or does not respond to the custom URL schema
    // redirect in the browser to the landing page after 2 seconds
    setTimeout(function () { redirectToCDN(); }, 2000);
    // redirect to the custom URL schema
    window.location = generateViewFileURL();
    
  } else if(isMobile.Android()){
    // store a cookie, with a fixed lifespan, and load the link only if the cookie has expired. 
    // otherwise, do something to prevent the loop.
    
    // this approach is needed, because when the user return to the browser, this page will 
    // be reloaded, the Android app will get opened and the user will be stuck in a browser-app loop.
    
    var lastLoadedViewFileURL = getCookie("androidViewFileURL");
    var currentViewFileURL = generateViewFileURL();
    if(lastLoadedViewFileURL !== currentViewFileURL)
    {
      setCookie("androidViewFileURL", currentViewFileURL);
      // setTimeout(redirectToCDNVar, 2000);
      // window.location = currentViewFileURL;

      if(navigator.userAgent.indexOf("Chrome") >= 0 && parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) >= 18){
          setTimeout(redirectToCDN(), 2000);
          window.location.href = "intent:" + getRedirectToCDNLink() + "#Intent;package=com.cloudon.client;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end";
        } else {
          redirectToCDN();  
        }
      // loadAndroidURLScheme(currentViewFileURL);
      
    } else 
    {
      // the cookie did not expire, which means here we must do some logic to avoid the browser-app loop.
      // we must ask the user if he wants to reopen CloudOn app.
      var openCloudOn = confirm("Open file using CloudOn?");
      if(openCloudOn)
      {
        setCookie("androidViewFileURL", currentViewFileURL);
        if(navigator.userAgent.indexOf("Chrome") >= 0 && parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) >= 18){
          setTimeout(redirectToCDN(), 2000);
          window.location.href = "intent:" + getRedirectToCDNLink() + "#Intent;package=com.cloudon.client;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end";
        } else {
          redirectToCDN();  
        }
        
        // window.location = currentViewFileURL;
        // loadAndroidURLScheme(currentViewFileURL);
      }
      else
      {
        window.location = "http://www.cloudon.com/";
      }
  
      
    }
  } else if ("sharedLink" == type) {
    // not on iOS or Android & we're in the sharedLink flow, start downloading the file
    window.location = apiUrl + "/downloadSharedLink?linkId=" + window.location.getParameter("linkId");
  }
  
  else {
    // not iOS or Android and we're on the sharedFile flow, show the viewFile.html
    redirectToCDN();
  }
}

function loadAndroidURLScheme(url) {
  // var iframe = document.createElement('iframe');
  // iframe.style.visibility = 'none';
  // iframe.style.position = 'absolute';
  // iframe.style.left = '-999px';
  // iframe.style.height = '1px';
  // iframe.style.width = '1px';
  setTimeout(function() {
              // if(document.readyState === "complete"){
                  redirectToCDN();
              // }
            }, 300);
  window.location = url;

  // iframe.src = url;
  // document.body.appendChild(iframe);
}

var isMobile = {
  Android: function() {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function() {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};

var appLink = {
  url: function() {
    if (isMobile.Android()) {
      // Linking to Android market place
      // From a web site: http://play.google.com/store/apps/details?id=com.cloudon.client
      // From an Android app: market://details?id=com.cloudon.client

      return "market://details?id=com.cloudon.client";
    }
    else if (isMobile.iOS()) {
      return "itms-apps://itunes.apple.com/app/cloudon/id474025452";
    }
    else if (!isMobile.any()) {
      return "http://www.cloudon.com";
    }
  },

  linkText: function() {
    if (isMobile.Android()) {
      return "Download from Play Store";
    }
    else if (isMobile.iOS()) {
      return "Download from App Store";
    }
    else if (!isMobile.any()) {
      return "View on the web";
    }
  },

  badgeImageSrc: function() {
    if (isMobile.Android()) {
      return "img/Google_Play_Badge@2x.png";
    }
    else if (isMobile.iOS()) {
      return "img/App_Store_Badge@2x.png";
    }
    else if (!isMobile.any()) {
      return "";
    }
  }
};

if (!window.location.getParameter) {
  window.location.getParameter = function(key) {
    function parseParams() {
      var params = {},
        e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&=]+)=?([^&]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.search.substring(1);

      while (e = r.exec(q)) {
        params[d(e[1])] = d(e[2]);
      }

      return params;
    }

    if (!this.queryStringParams) {
      this.queryStringParams = parseParams();
    }

    return this.queryStringParams[key];
  };
}

// the custom URL schema that will launch the mobile client
function generateViewFileURL() {
  // based on the type this is a shareLink or shareFile flow
  var urlSchema = "cloudon"; // shareLink
  if("sharedFile" == window.linkType) {
    urlSchema = "cloudon-shared"; // shareFile
  }
  var url = urlSchema + "://viewFile?linkId=" + window.linkId;
  return url;
}

// used to redirect to the viewFile.html on CDN, in case the mobile client does not have the app installed
function redirectToCDN() {
  if (!document.webkithidden) {
    window.location = getRedirectToCDNLink();
  }
}

function getRedirectToCDNLink(){
    var prodHost = "http://static-cdn.cloudon.com";
    var devHost = "http://s3.amazonaws.com";
    // depending on where the shareFile redirect comes from, we need to hit the prod or the dev CDN environment
    var hostName = devHost;
    if (window.apiUrl.indexOf("api.cloudon.com") != -1) {
      hostName = prodHost;
    }
    return hostName + "/shareLink/v1/viewFile.html?apiUrl=" + window.apiUrl + "&type=" + window.linkType + "&linkId=" + window.linkId;
}

// used from the viewFile.html to set up dynamically the page depending on the mobile client
function configureLinks( ) {
  // Setup the AppStore / Play link
  document.getElementById("appLink").href = appLink.url();
  // Load the correct Badge
  document.getElementById("badge").src = appLink.badgeImageSrc();
  // the download section is hidden, only visible for sharedLink
  document.getElementById("downloadParagraph").style.display = "none";
  var type = window.location.getParameter("type");
  if("sharedLink" == type) {
    // the download paragraph is visible
    document.getElementById("downloadParagraph").style.display = "block";
    // Setup the download link
    var apiUrl = decodeURIComponent(window.location.getParameter("apiUrl"));
    var linkId = window.location.getParameter("linkId");
    var downloadLink = apiUrl + "/downloadSharedLink?linkId=" + linkId;
    document.getElementById("fileLink").href = downloadLink;
  }
}

/*
Deletes the cookie specified by 'cookieName', if it exists.
*/
function deleteCookie (cookieName)
{
    document.cookie = cookieName + "=; max-age=0; path=/";
}

/*
Gets a cookie using the cookieName. If no cookie is found, it will return an empty string.
*/
function getCookie (cookieName)
{
    var cookieString = document.cookie ;
    if (cookieString.length != 0) {
        var cookieValue = cookieString.match (
                        '(^|;)[\s]*' +
                        cookieName +
                        '=([^;]*)' );
        return decodeURIComponent ( cookieValue[2] ) ;
    }
    return '' ;
}

/*
Sets a cookie, that will expire after 3 min.
*/
function setCookie (cookieName, cookieValue)
{
    document.cookie = cookieName +
                       "=" + encodeURIComponent( cookieValue ) +
                       "; max-age=" + 60 * 3 +
                       "; path=/";
}