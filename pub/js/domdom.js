window.dom = {};

dom.dragging = {
    element: null,
    offset:  null,
    index:   null,
    target:  null
};

dom.sorting = {
    element: null,
    count: null,
    positions: []
};

dom.sortable = function (list, callback) {
    dom.sorting.element = list;
    dom.sorting.callback = callback;
    dom.sorting.count = list.childElementCount;

    list.children.forEach(dom.draggable);
};

document.onmouseup = function () {
    var list = dom.sorting.element;

    if (dom.dragging.element) {
        list.removeChild(dom.dragging.element);
        dom.dragging.target.removeClass('ghost');
        dom.sorting.element.removeClass('unselectable');

        dom.sorting.callback(dom.dragging.element.firstChild.getAttribute('data-title'), dom.dragging.index);

        dom.dragging.element = null;
        dom.dragging.offset  = null;

        list.children.forEach(dom.enableSelection);
    }
};
document.onmousemove = function (e) {
    var offset, element, list, position, prev, next;

    dom.mouse = { x: e.pageX, y: e.pageY };

    if (dom.dragging.element) {
        dom.dragging.element.style.top = (dom.mouse.y - dom.dragging.offset.y) + 'px';

        list = dom.sorting.element;

        if (dom.dragging.index > 0) {
            prev = list.children[dom.dragging.index - 1];

            if (dom.mouse.y < dom.getPosition(prev).y + dom.dragging.element.clientHeight) {
                dom.dragging.index --;
                list.insertBefore(dom.dragging.target, prev);
                return dom.refreshPositions(list);
            }
        }

        if (dom.dragging.index < dom.sorting.count) {
            next = list.children[dom.dragging.index + 1];

            if (dom.mouse.y > dom.getPosition(next).y) {
                dom.dragging.index ++;
                list.insertBefore(dom.dragging.target, next.nextSibling);
                return dom.refreshPositions(list);
            }
        }
        return false;
    }
};

dom.refreshPositions = function (elem) {
    dom.sorting.positions = elem.children.map(dom.getPosition);
    return false;
};

dom.draggable = function (elem) {
    elem.onmousedown = function (e) {
        var source = e.srcElement || e.target;

        if (source.nodeName === 'LI' || source.nodeName === 'DIV') {
            while (source !== elem) {
                if (source === document.body) { return true }
                else                          { source = source.parentNode }
            } 
        } else { return true }

        var pos   = dom.getPosition(this);
        var clone = this.cloneNode(true);

        this.parentNode.appendChild(clone);

        this.addClass('ghost');
        clone.addClass('dragging');
        dom.sorting.element.addClass('unselectable');

        dom.dragging.index   = list.children.indexOf(this);
        dom.dragging.offset  = { x: e.pageX - pos.x, y: e.pageY - pos.y };
        dom.dragging.element = clone;
        dom.dragging.target  = this;

        // Disable text selection while dragging
        dom.sorting.element.children.forEach(dom.disableSelection);
        document.onmousemove(e);
    };
};

dom.removeClass = function (e, name) {
    if (! e.className) { return }

    var classes = e.className.split(' '),
        index = classes.indexOf(name);

    if (index !== -1) {
        classes.splice(index, 1);
        e.setAttribute('class', classes.join(' '));
    }
};
dom.addClass = function (e, name) {
    var classes = e.className ? e.className.split(' ') : [];

    if (classes.indexOf(name) === -1) {
        e.setAttribute('class', classes.concat(name).join(' ').trim());
    }
};
dom.getPosition = function (e) {
    var left = 0;
    var top  = 0;

    var cached = null;

    if (cached = dom.sorting.positions[list.children.indexOf(e)]) {
        return cached;
    }

    while (e.offsetParent) {
        left += e.offsetLeft;
        top  += e.offsetTop;
        e     = e.offsetParent;
    }

    left += e.offsetLeft;
    top  += e.offsetTop;

    return { x: left, y: top };
}

dom.createElement = function (name, attrs, html) {
    var e = document.createElement(name);

    for (var a in (attrs || {})) {
        e[a] = attrs[a];
    }
    html && (e.innerHTML = html);

    return e;
};

dom.hsla = function (h, s, l, a) {
    return 'hsla(' + [h, s + '%', l + '%', a].join(',') + ')';
};

dom.flash = function (element) {
    var alpha = 80, inc = 1;

    var timer = setInterval(function () {
        element.style.backgroundColor = dom.hsla(60, 90, 95, alpha / 100);
        alpha += inc;

        if (alpha === 100) { inc = -0.3 }
        if (alpha <= 0)    { clearInterval(timer), element.style.backgroundColor = '' }
    }, 5);
};

dom.disableSelection = function (element) {
    element.onselectstart = function () { return false };
    element.unselectable = "on";
};
dom.enableSelection = function (element) {
    element.onselectstart = null;
    element.unselectable = "off";
};
dom.show = function (e) {
    return e.style.display = '';
};
dom.hide = function (e) {
    return e.style.display = 'none';
};

//
// DOM Prototype Extensions
//
NodeList.prototype.forEach = function (fun) {
    return Array.prototype.forEach.call(this, fun);
};
NodeList.prototype.map = function (fun) {
    return Array.prototype.map.call(this, fun);
};
NodeList.prototype.indexOf = function (obj) {
    return Array.prototype.indexOf.call(this, obj);
};
HTMLCollection.prototype.forEach = function (fun) {
    return Array.prototype.forEach.call(this, fun);
};
HTMLCollection.prototype.map = function (fun) {
    return Array.prototype.map.call(this, fun);
};
HTMLCollection.prototype.indexOf = function (obj) {
    return Array.prototype.indexOf.call(this, obj);
};
HTMLElement.prototype.addClass = function (class) {
    return dom.addClass(this, class);
};
HTMLElement.prototype.removeClass = function (class) {
    return dom.removeClass(this, class);
};

//
// Object & Array ECMA 5 methods
//
if (! Array.isArray) {
    Array.isArray = function (obj) {
        return obj instanceof Array;
    };
}
