//Note: DOMMouseScroll is considered deprecated
//(https://developer.mozilla.org/en-US/docs/Web/API/Element/DOMMouseScroll_event) but keeping it for now
const ScrollController = (function(){
    const _keys = {37: 1, 38: 1, 39: 1, 40: 1}; //Ignore spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36

    function DisableScrolling(){
        if (window.addEventListener) {
            window.addEventListener('DOMMouseScroll', _preventDefault, false);
        }
        document.addEventListener('wheel', _preventDefault, {passive: false}); //Firefox and Opera
        window.onmousewheel = document.onmousewheel = null; //For older browsers
        document.onkeydown = (e) => {
            if (_keys[e.keyCode]) {
                _preventDefault(e);
            }
        }
        window.ontouchmove  = _preventDefault;
    }

    function EnableScrolling(){
        if (window.removeEventListener) {
            window.removeEventListener('DOMMouseScroll', _preventDefault, false);
        }
        document.removeEventListener('wheel', _preventDefault, {passive: false}); //Firefox and Opera
        window.onmousewheel = document.onmousewheel = _preventDefault; //For older browsers
        document.onkeydown = null;
        window.ontouchmove = null;
    }

    function _preventDefault(e){
        e = e || window.event;
        if (e.preventDefault){
            e.preventDefault();
        }
        e.returnValue = false;
    }

    return {
        EnableScrolling: EnableScrolling,
        DisableScrolling: DisableScrolling
    };
}());