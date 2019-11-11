///THE MAIN JS FILE///
//Depends on scrollController.js
(function(){
    ///DECLARATIONS///
    //ScrollButton
    var scrollBTN;
    var scrollBTNCreated;
    var isAutoScrolling;
    const scrollSpeed = 30;

    //SlideShowObject
    var slideShowOb;
    var slideShowObCreated;
    var slideShowObOpen;
    var slideShowImages; //The three actual images

    //SlideShowSets
    var slideShowSets = {};
    var currentSlideShowSet;
    var currentSlideShowSetIndex;

    //Media Queries
    var inSecondLayout;
    const secondLayoutQuery = "(min-width: 45em)";

    ///EVENTS///
    //PostImages
    const postImages = document.getElementsByClassName("postImage");
    for (let x = 0; x < postImages.length; x++){
        postImages[x].addEventListener("click", (e)=>{
            if (isAutoScrolling) //Can't open the slideshow while scrolling up
                return;
            e.preventDefault();

            //Create SlideShowObject
            if (!slideShowObCreated){
                CreateSlideShowOb();
            }

            //Add SlideShowSet
            let setID = e.target.closest(".post").id;
            if (slideShowSets[setID] == null){
                slideShowSets[setID] = {};
                slideShowSets[setID].imageElements = document.getElementById(setID).getElementsByClassName("postImage");
                slideShowSets[setID].lastImage = slideShowSets[setID].imageElements.length-1;
                slideShowSets[setID].imageSrcs = [];
                for (let x = 0; x <= slideShowSets[setID].lastImage; x++){
                    slideShowSets[setID].imageSrcs[x] = slideShowSets[setID].imageElements[x].src;
                }
            }

            //Find the current set and index
            for (let x = 0; x <= slideShowSets[setID].lastImage; x++){
                if (e.target === slideShowSets[setID].imageElements[x]){
                    currentSlideShowSet = setID;
                    currentSlideShowSetIndex = x;
                    break;
                }
            }

            //Start the slideshow
            ShowSlideShowImages();
            PositionSlideShowImages();

            //Finish Up
            ScrollController.DisableScrolling();
            slideShowOb.classList.add("active");
            slideShowObOpen = true;
        }, false);
    }

    //OnScroll
    window.addEventListener("scroll", ()=>{
        if (!scrollBTNCreated){
            CreateScrollBTN();
        }

        if (window.pageYOffset === 0){
            scrollBTN.classList.remove("active");
        }
        else {
            scrollBTN.classList.add("active");
        }
    }, false);

    //Post Texts
    const postTexts = document.getElementsByClassName("postText");
    for (let x = 0; x < postTexts.length; x++){
        if (postTexts[x].clientHeight <= 150)
            continue;
        postTexts[x].classList.add("mini");
        postTexts[x].addEventListener("click", (e)=>{
            let txt = e.target.closest("div");
            txt.classList.remove("mini");
        }, false);
    }

    ///MEDIA MATCHES///
    document.addEventListener("DOMContentLoaded", (e)=>{
        var secondLayoutMatcher = window.matchMedia(secondLayoutQuery);
        secondLayoutTester();
        secondLayoutMatcher.addListener(secondLayoutTester);

        function secondLayoutTester(){
            if (secondLayoutMatcher.matches){
                inSecondLayout = true;
            }
            else {
                inSecondLayout = false;
            }
    
            if (slideShowObOpen){
                ShowSlideShowImages();
            }
        }
    }, false);

    ///****THE FUNCTIONS****///
    ///SLIDE SHOW FUNCTIONS///
    function CreateSlideShowOb(){
        slideShowOb = document.createElement("div");
        slideShowOb.id = "slideShowOb";
        document.getElementById("siteWrapper").appendChild(slideShowOb);

        //Images
        slideShowImages = [];
        for (let x = 0; x < 3; x++){
            slideShowImages[x] = document.createElement("img");
            slideShowImages[x].classList.add("slideShowImage");
            slideShowOb.appendChild(slideShowImages[x]);
            if (x == 0){
                slideShowImages[x].addEventListener("click", GoToPrevSlide, false);
            }
            else {
                slideShowImages[x].addEventListener("click", GoToNextSlide, false);
            }
        }

        //Add the Modal Click Event
        slideShowOb.addEventListener("click", (e)=> {
            for (let x = 0; x < slideShowImages.length; x++){
                if (slideShowImages[x] === e.target)
                    return;
            }
            CloseSlideShowOb();
        }, false);

        //Add the resize event
        window.addEventListener("resize", ()=>{
            if (!slideShowObOpen)
                return; 
            PositionSlideShowImages();
        }, false);

        //Add keypress events
        window.addEventListener("keyup", (e)=>{
            if (!slideShowObOpen)
                return;
            if (e.keyCode == 27){ //Escape key
                CloseSlideShowOb();
            }
            else if (e.keyCode == 37){ //Left arrow
                GoToPrevSlide();
            }
            else if (e.keyCode == 39){ //Right arrow
                GoToNextSlide();
            }
        }, false);

        //Finish
        slideShowObCreated = true;
    }

    function CloseSlideShowOb(){
        ScrollController.EnableScrolling();
        slideShowOb.classList.remove("active");
        slideShowObOpen = false;
    }

    function ShowSlideShowImages(){
        let noOfImages = (!inSecondLayout)?0:slideShowSets[currentSlideShowSet].lastImage;
        slideShowImages[0].style.display = (noOfImages > 1)?"block":"none";
        slideShowImages[1].style.display = "block"; //Just encase
        slideShowImages[2].style.display = (noOfImages > 0)?"block":"none";
        AssignSlides();
    }
    
    //This function assumes all slideshow sets have at least 3 images, which will not be the case
    //However, this only causes the slideshowimages to show blank images which will be hidden from the user
    //This method feels most efficient and does not seem to cause any problems (even on the console)
    function AssignSlides(){
        let startSlide = (currentSlideShowSetIndex == 0)?slideShowSets[currentSlideShowSet].lastImage:currentSlideShowSetIndex-1;
        for (let x = 0; x < slideShowImages.length; x++){
            slideShowImages[x].setAttribute("src", slideShowSets[currentSlideShowSet].imageSrcs[startSlide]);
            startSlide = (startSlide == slideShowSets[currentSlideShowSet].lastImage)?0:startSlide+1;
        }
    }

    //Note: due needing to use the positions and size of the image, we can't use the CSS max-width/height properties
    function PositionSlideShowImages(){
        let screenHalfWidth = window.innerWidth * .5;
        let widthLimit = (inSecondLayout)?window.innerWidth * .4:window.innerWidth * .6;
        let heightLimit = window.innerHeight * .6;

        for (let x = 0; x < slideShowImages.length; x++){
            let imgWidth = slideShowImages[x].naturalWidth;
            if (imgWidth > widthLimit){
                imgWidth = widthLimit;
            }

            let imgHeight = slideShowImages[x].naturalHeight;
            if (imgHeight > heightLimit){
                imgHeight = heightLimit;
            }

            let posX = 0 - (imgWidth * .5) + (screenHalfWidth * x);
            let posY = window.innerHeight * .5 - (imgHeight * .5);

            slideShowImages[x].style.width = imgWidth + "px";
            slideShowImages[x].style.height = imgHeight + "px";
            slideShowImages[x].style.top = posY + "px";
            slideShowImages[x].style.left = posX + "px";
        }
    }

    ///HELPER FUNCTIONS///
    function GoToNextSlide(){
        if (!slideShowObOpen || OnlyOneSlide())
            return;
        currentSlideShowSetIndex = (AtLastSlide())?0:currentSlideShowSetIndex+1;
        AssignSlides();
    }
    
    function GoToPrevSlide(){
        if (!slideShowObOpen || OnlyOneSlide())
            return;
        currentSlideShowSetIndex = (currentSlideShowSetIndex==0)?slideShowSets[currentSlideShowSet].lastImage:currentSlideShowSetIndex-1;
        AssignSlides();
    }

    function OnlyOneSlide(){
        return slideShowSets[currentSlideShowSet].lastImage === 0;
    }

    function AtLastSlide(){
        return currentSlideShowSetIndex == slideShowSets[currentSlideShowSet].lastImage;
    }

    ///SCROLL FUNCTIONS///
    function CreateScrollBTN(){
        scrollBTN = document.createElement("div");
        scrollBTN.id = "scrollBTN";
        scrollBTN.classList.add("active");
        document.getElementById("siteWrapper").appendChild(scrollBTN);

        //Ensure the slide show object covers the scroller
        if (slideShowObCreated){
            document.getElementById("siteWrapper").appendChild(slideShowOb);
        }

        let arrowImg = document.createElement("div");
        scrollBTN.appendChild(arrowImg);

        scrollBTN.addEventListener("click", ()=>{
            if (isAutoScrolling)
            return;

            var scrollUpRequestWrapper;
            var scrollUp = ()=>{
                if (window.pageYOffset === 0){
                    cancelAnimationFrame(scrollUpRequestWrapper);
                    ScrollController.EnableScrolling();
                    isAutoScrolling = false;
                }
                else {
                    window.scrollBy(0, -scrollSpeed);
                    scrollUpRequestWrapper = requestAnimationFrame(scrollUp);
                }
            }
            ScrollController.DisableScrolling();
            scrollUpRequestWrapper = requestAnimationFrame(scrollUp);
            isAutoScrolling = true;
        }, false);

        scrollBTNCreated = true;
    }
})();