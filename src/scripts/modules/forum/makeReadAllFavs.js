import { Module } from '../module'
import { dataStore } from '../../content'

export const makeReadAllFavs = new Module('makeReadAllFavs')

makeReadAllFavs.activate = () => {

  // Create the 'read them all' button
  $('section#sidebar-user-favorites h4').append('<span style="cursor: pointer;">[<div id="ext_read_faves" style="display: inline-block;"></div>]</span>')

  var read_faves = $('#ext_read_faves');
  // Move the button away if unreaded faves is on
  if (dataStore['favShowOnlyUnread'] === 'true' && isLoggedIn()) {
    read_faves.css('right', 36)
  }

  // Append the image
  /*$('<img src="'+chrome.extension.getURL('/img/content/makereaded.png">')+'').appendTo(read_faves);*/
  $('<div id="icon">&#9675;</div>').appendTo('#ext_read_faves')

  // Add click event
  read_faves.click(function () {
    makeReadAllFavs.makeread()
  })
}

makeReadAllFavs.makeread = () => {

  if (confirm('Biztos olvasottnak jelölöd az összes kedvenced?')) {

    // Set 'in progress' icon
    //$('#ext_read_faves').find('img').attr('src', chrome.extension.getURL('/img/content/makereaded_waiting.png') );
    $('#ext_read_faves').find('#icon').html('&#9684;')

    var count = 0
    var counter = 0

    var links = $('.ext_faves').find('a')

    // Get unreaded topics count
    links.each(function () {

      // Dont bother the forum categories
      if ($(this).is('.category')) {
        return true
      }

      // Also dont bother readed topics
      if ($(this).hasClass('fav-not-new-msg')) {
        return true
      }

      count++
    });

    // Iterate over all faves
    links.each(function () {

      // Dont bother the forum categories
      if ($(this).is('.category')) {
        return true
      }

      // Also dont bother readed topics
      if ($(this).hasClass('fav-not-new-msg')) {
        return true
      }

      var ele = $(this)

      // Make an ajax query to refresh last readed time
      $.get($(this).attr('href'), function () {

        $(ele).find('span.new').remove()
        $(ele).find('.ext_short_comment_marker').remove()

        if (dataStore['favShowOnlyUnread'] === 'true' && favShowOnlyUnreadRememberOpened.opened === false) {
          $(ele).parent().addClass('ext_hidden_fave')
        }

        counter++;
      }, 'html');
    });

    var interval = setInterval(function () {

      if (count === counter) {

        // Set 'completed' icon / black circle
        $('#ext_read_faves').html('&#9679;')

        // Set normal icon
        setTimeout(function () {
          $('#ext_read_faves').html('&#9675;')
        }, 2000);

        // Faves: show only with unreaded messages
        if (dataStore['favShowOnlyUnread'] === 'true' && isLoggedIn()) {
          favShowOnlyUnread.activated()
        }

        // Reset faves newmsg vars
        if (dataStore['jumpUnreadMessages'] === 'true' && isLoggedIn()) {
          jumpUnreadMessages.activated()
        }

        clearInterval(interval)
      }

    }, 100)

  }

}

makeReadAllFavs.toggle = () => {

  if (dataStore['user']['isLoggedIn'])
    makeReadAllFavs.activate()
}