(function () {
  var $ = function (selector) {
        return document.querySelector(selector);
      },
      on = function (selector, events, callback) {
        var i;

        events = events.split(' ');

        for (i = 0; i < events.length; i++) {
          $(selector).addEventListener(events[i], callback, false);
        }
      },
      init,
      itemTpl,
      items,
      getRandomId,
      timeToMinSec,
      updateStorageAndDisplay,
      addItem,
      addNewItem,
      $countingItem,
      countingItem,
      countingIntervalId,
      countingInitValue,
      countingInitDate;

  init = function () {
    var itemId;

    // Load item template
    itemTpl = $('.item-tpl').innerHTML.trim();
    $('.item-tpl').parentNode.removeChild($('.item-tpl'));

    // Initialize items
    items = JSON.parse(localStorage.getItem('babbler.items')) || {};
    for (itemId in items) {
      if (items.hasOwnProperty(itemId)) {
        addItem(items[itemId]);
      }
    }
    addNewItem();
    updateStorageAndDisplay();
  };

  getRandomId = function () {
    return 'item-' + Math.floor(Math.random() * 1e32).toString(36);
  };

  timeToMinSec = function (time) {
    var min = Math.floor(time / 60000),
        sec = Math.floor(time / 1000) - min * 60;

    if (min < 10) {
      min = '0' + min;
    }

    if (sec < 10) {
      sec = '0' + sec;
    }

    return min + ':' + sec;
  };

  updateStorageAndDisplay = function () {
    var totalCounter = 0,
        id;

    // Total counter
    if (Object.keys(items).length > 0) {
      totalCounter = Object.keys(items)
          .map(function (itemId) {
            return items[itemId].counter;
          })
          .reduce(function (counterA, counterB) {
            return counterA + counterB;
          });
    }

    // Total percent
    if (Object.keys(items).length > 1 && totalCounter > 1) {
      $('.total-counter').innerHTML = timeToMinSec(totalCounter);
      $('.total-percent').innerHTML = '100%';
    } else {
      $('.total-counter').innerHTML = '';
      $('.total-percent').innerHTML = '';
    }

    // All the percents
    for (id in items) {
      if (Object.keys(items).length > 1) {
        if (totalCounter > 0) {
          $('#' + id + ' .item-percent').innerHTML = (items[id].counter * 100 / totalCounter).toFixed(0) + '%';
        } else {
          $('#' + id + ' .item-percent').innerHTML = '';
        }
      } else {
        $('#' + id + ' .item-percent').innerHTML = '';
      }
    }

    // Storage
    localStorage.setItem('babbler.items', JSON.stringify(items));
  };

  // Add item to the DOM
  addItem = function (item) {
    var tpl = itemTpl,
        tplNode;

    tpl = tpl.replace('${id}', item.id);
    tpl = tpl.replace('${name}', item.name);
    tpl = tpl.replace('${counter}', timeToMinSec(item.counter));
    tpl = tpl.replace('${percent}', '0%');

    tplNode = document.createElement('div');
    tplNode.innerHTML = tpl;

    $('body').appendChild(tplNode.children[0]);
  };

  addNewItem = function () {
    addItem({
      id: 'new',
      'name': '',
      counter: 0
    });
  };

  // Help
  on('.help', 'click', function () {
    $('.help-message').classList.toggle('hidden');
  });

  // Item add or rename
  on('body', 'change keyup blur', function (ev) {
    var $item, id, name, item;

    if (!ev.target.classList.contains('item-name')) {
      return;
    }

    $item = ev.target.parentNode.parentNode;
    id = $item.id;
    name = ev.target.value;
    item = items[id];

    if (name !== '' && id === 'new') {
      id = getRandomId();

      items[id] = {
        id: id,
        name: name,
        counter: 0
      };

      $item.id = id;
      addNewItem();

      updateStorageAndDisplay();
    }
    if (id !== 'new') {
      items[id].name = name;
      updateStorageAndDisplay();
    }
  });

  // Item remove
  on('body', 'click', function (ev) {
    var id, item;

    if (!ev.target.classList.contains('item-remove')) {
      return;
    }

    id = ev.target.parentNode.id;
    item = items[id];

    if (countingIntervalId && item.id === countingItem.id) {
      countingIntervalId = clearInterval(countingIntervalId);
    }

    delete items[id];
    $('#' + id).parentNode.removeChild($('#' + id));
    updateStorageAndDisplay();
  });

  // Counter
  on('body', 'click', function (ev) {
    var $item,
        item;

    // Prevents bubble clicks on close and input
    if (ev.target.classList.contains('item')) {
      $item = ev.target;
      item = items[$item.id];
    } else if (ev.target.classList.contains('item-counter') ||
        ev.target.classList.contains('item-percent')) {
      $item = ev.target.parentNode;
      item = items[$item.id];
    } else {
      return;
    }

    if (countingIntervalId == null) {
      $item.classList.add('active');
      $countingItem = $item;
      countingItem = item;
      countingInitDate = new Date().getTime();
      countingInitValue = item.counter;

      countingIntervalId = setInterval(function () {
        var count = countingInitValue + new Date().getTime() - countingInitDate;
        count = count - count % 1000;
        $('#' + $countingItem.id + ' .item-counter').innerHTML = timeToMinSec(count);
        countingItem.counter = count;
        updateStorageAndDisplay();
      }, 200);
    } else {
      $countingItem.classList.remove('active');
      if (item.id === countingItem.id) {
        countingIntervalId = clearInterval(countingIntervalId);
      } else {
        $item.classList.add('active');
        $countingItem = $item;
        countingItem = item;
        countingInitDate = new Date().getTime();
        countingInitValue = item.counter;
      }
    }
  });

  init();
})();
