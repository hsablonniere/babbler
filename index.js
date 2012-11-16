(function () {
  var init,
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
    // Load item template
    itemTpl = $('.item-tpl').text();
    $('.item-tpl').remove();

    // Initialize items
    items = JSON.parse(localStorage.getItem('babbler.items')) || {};
    for (var itemId in items) {
      if (items.hasOwnProperty(itemId)) {
        addItem(items[itemId]);
      }
    }
    addNewItem();
    updateStorageAndDisplay();
  };

  getRandomId = function () {
    return Math.floor(Math.random() * 1e32).toString(36);
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
    var totalCounter = 0;

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
      $('.total-counter').html(timeToMinSec(totalCounter));
      $('.total-percent').html('100%');
    } else {
      $('.total-counter').html('');
      $('.total-percent').html('');
    }

    // All the percents
    for (var id in items) {
      if (Object.keys(items).length > 1) {
        if (totalCounter > 0) {
          $('#' + id + ' .item-percent').html((items[id].counter * 100 / totalCounter).toFixed(0) + '%');
        } else {
          $('#' + id + ' .item-percent').html('');
        }
      } else {
        $('#' + id + ' .item-percent').html('');
      }
    }

    // Storage
    localStorage.setItem('babbler.items', JSON.stringify(items));
  };

  // Add item to the DOM
  addItem = function (item) {
    var tpl = itemTpl;

    tpl = tpl.replace('${id}', item.id);
    tpl = tpl.replace('${name}', item.name);
    tpl = tpl.replace('${counter}', timeToMinSec(item.counter));
    tpl = tpl.replace('${percent}', '0%');

    $(tpl).appendTo('body');
  };

  addNewItem = function () {
    addItem({
      id: 'new',
      'name': '',
      counter: 0
    });
  };

  // Help
  $('.help').on('click', function () {
    $('.help-message').toggleClass('hidden');
  });

  // Item add or rename
  $('body').on('change keyup blur', '.item-name', function (ev) {
    var $item = $(this).parents('.item'),
        id = $item.attr('id'),
        name = $(this).val(),
        item = items[id];

    if (name !== '' && id === 'new') {
      id = getRandomId();

      items[id] = {
        id: id,
        name: name,
        counter: 0
      };
      updateStorageAndDisplay();

      $item.attr('id', id);
      addNewItem();
    }
    if (id !== 'new') {
      items[id].name = name;
      updateStorageAndDisplay();
    }
  });

  // Item remove
  $('body').on('click', '.item-remove', function (ev) {
    var id = $(this).parents('.item').attr('id'),
        item = items[id];

    if (countingIntervalId && item.id === countingItem.id) {
      countingIntervalId = clearInterval(countingIntervalId);
    }

    delete items[id];
    $('#' + id).remove();
    updateStorageAndDisplay();
  });

  // Counter
  $('body').on('click', '.item:not(#new)', function (ev) {
    var $item,
        item;

    // Prevents bubble clicks on close and input
    if ($(ev.target).is('.item, .item-counter, .item-percent')) {
      $item = $(ev.currentTarget);
      item = items[$item.attr('id')];

      if (countingIntervalId == null) {
        $item.addClass('active');
        $countingItem = $item;
        countingItem = item;
        countingInitDate = new Date().getTime();
        countingInitValue = item.counter;

        countingIntervalId = setInterval(function () {
          var count = countingInitValue + new Date().getTime() - countingInitDate;
          count = count - count % 1000;
          $countingItem.find('.item-counter').html(timeToMinSec(count));
          countingItem.counter = count;
          updateStorageAndDisplay();
        }, 200);
      } else {
        $countingItem.removeClass('active');
        if (item.id === countingItem.id) {
          countingIntervalId = clearInterval(countingIntervalId);
        } else {
          $item.addClass('active');
          $countingItem = $item;
          countingItem = item;
          countingInitDate = new Date().getTime();
          countingInitValue = item.counter;
        }
      }
    }
  });

  init();
})();
