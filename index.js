var getRandomId = function () {
    return Math.floor(Math.random()*1e32).toString(36) + Math.floor(Math.random()*1e32).toString(36);
};

var updateStorage = function () {
    localStorage.setItem('groupTimer.users', JSON.stringify(users));
};

var formatTime = function (time) {
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

var addUser = function (id, name, counter) {
    id = id || getRandomId();
    name = name || '';
    counter = counter || 0;
    
    var tpl = $('.user-tpl').text();
    tpl = tpl.replace('${id}', id);
    tpl = tpl.replace('${name}', name);
    tpl = tpl.replace('${counter}', formatTime(counter));
    
    $(tpl).insertBefore('.user-add-block').children('.user-name').focus();
    
    $('.user-add-block')[0].scrollIntoView(true);
    
    return {
        id: id,
        name: name,
        counter: counter
    };
};

var users = JSON.parse(localStorage.getItem('groupTimer.users')) || {};

for (var userId in users) {
    addUser(users[userId].id, users[userId].name, users[userId].counter);
}
$('input').blur();

$('.user-add').on('click', function (ev) {
    var user = addUser();
    users[user.id] = user;
    updateStorage();
});

$('body').on('click', '.user-remove', function (ev) {
    delete users[$(this).parents('.user').attr('id')];
    $(this).parents('.user').remove();
    updateStorage();
});

$('body').on('change keydown blur', '.user-name', function (ev) {
    users[$(this).parents('.user').attr('id')].name = $(this).val();
    updateStorage();
});

$('body').on('click', '.user-name', function (ev) {
    ev.stopImmediatePropagation();
    ev.stopPropagation();
});

var currentCounterUser;
var currentDomUser;
var startTS;
var startValue;
var currentInterval = 0;

$('body').on('click touchstart', '.user', function (ev) {
    var lastId = currentCounterUser ? currentCounterUser.id : null,
        id = $(this).attr('id');
    
    // Stop current counter
    if (currentInterval !== 0) {
        currentDomUser.removeClass('counting');
        
        clearInterval(currentInterval);
        currentCounterUser = null;
        currentDomUser = null;
        startTS = null;
        startValue = null;
        currentInterval = 0;
    }
    
    // Starts new counter if button different from current one
    if (lastId !== id) {
        currentCounterUser = users[id];
        startTS = new Date().getTime();
        currentDomUser = $(this);
        startValue = currentCounterUser.counter;
        
        currentDomUser.addClass('counting');

        currentInterval = setInterval(function() {
            currentCounterUser.counter = startValue + (new Date().getTime() - startTS);
            currentDomUser.find(' .user-counter').html(formatTime(currentCounterUser.counter));
            updateStorage();
        }, 200);
    }
});
