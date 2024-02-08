document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded");

    var player = videojs("my-video");
    console.log("Video.js player initialized");

    var vastTagPreroll =
      "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=";
    var vastTagMidroll =
      "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=";
    var vastTagPostroll =
      "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpostonly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&correlator=";
    var prerollTriggered = false;
    var postrollTriggered = false;
    var midrollRequested = false;
    var midrollInterval = 5 * 60; // 5 minutes
    var lastMidrollTime = 0; // The time when the last mid-roll ad was played

    if (!prerollTriggered) {
      player.ima({
        adTagUrl: vastTagPreroll,
        showControlsForAds: true,
        debug: false,
      });
    } else {
      player.ima({
        adTagUrl: '',
        showControlsForAds: true,
        debug: false,
      });
    }

    console.log("IMA settings configured");

    player.ima.initializeAdDisplayContainer();
    console.log("IMA ad display container initialized");

    function requestMidrollAd() {
      midrollRequested = true;
      player.ima.changeAdTag(vastTagMidroll);
      player.ima.requestAds();
    }

    player.on("timeupdate", function () {
      var currentTime = player.currentTime();
      console.log("Current time:", currentTime);
      var timeSinceLastMidroll = currentTime - lastMidrollTime;

      if (timeSinceLastMidroll >= midrollInterval && !midrollRequested) {
        lastMidrollTime = currentTime; // Update the last mid-roll ad time
        console.log("Midroll triggered");
        requestMidrollAd();
      }
    });

  player.on("ended", function () {
      console.log("Video ended");
      if (!postrollTriggered) {
        postrollTriggered = true;
        console.log("Postroll triggered");

        player.ima.requestAds({
          adTagUrl: vastTagPostroll,
        });

        console.log("Postroll ads requested");
      }
    });

    player.on("adsready", function () {
      if (midrollRequested) {
        console.log("Ads ready - midroll");
      } else {
        console.log("Ads ready - preroll");
        player.src(
          "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8"
        );
      }
    });

    player.on("aderror", function () {
      console.log("Ads aderror");
      player.play();
    });

    player.on("adend", function () {
      if (lastMidrollTime > 0) {
        console.log("A midroll ad has finished playing.");
        midrollRequested = false;
      } else {
        console.log("The preroll ad has finished playing.");
        prerollTriggered = true;
      }

player.play();
    });
  });
