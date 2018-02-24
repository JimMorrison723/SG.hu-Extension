import { Module } from '../module'
import { dataStore, PAGE } from './../../content'

export const jumpUnreadMessages = new Module('jumpUnreadMessages')

jumpUnreadMessages.activate = () => {

  var msgPerPage = dataStore['msgPerPage']

  $('#favorites-list').find('span').find('a').each(function () { //.ext_faves'

    // If theres a new message
    if ($(this).find('span[class="new"]').length > 0) {

      // Get the new messages count
      var newMsg = parseInt($(this).find('span[class="new"]').html().match(/\d+/g))

      // Get last msn's page number
      var page = Math.ceil(newMsg / msgPerPage)

      // Rewrite the url
      $(this).attr('href', $(this).attr('href') + '?order=desc&page=' + page + '&newmsg=' + newMsg)
      //$(this).attr('href', $(this).attr('href') + '#last-read')

      // Remove newmsg var from link
    } else if ($(this).attr('href').indexOf('&order') !== -1) {

      var start = $(this).attr('href').indexOf('&order')

      $(this).attr('href', $(this).attr('href').substring(0, start))
    }
  });
}

jumpUnreadMessages.disable = () => {

  $('#favorites-list').find('a').each(function () {

    if ($(this).attr('href').indexOf('&order') !== -1) {

      var start = $(this).attr('href').indexOf('&order')

      $(this).attr('href', $(this).attr('href').substring(0, start))
    }
  });
}

jumpUnreadMessages.topic = () => {

  var msgPerPage = dataStore['msgPerPage']

  // Get new messages counter
  var newMsg = document.location.href.split('&newmsg=')[1]

  // Return if there is not comment counter set
  if (typeof newMsg === "undefined" || newMsg === '' || newMsg === 0) {
    return false
  }

  // Get the last msg
  var lastMsg = newMsg % msgPerPage
  var target
  var last_read = $('a#last-read')

  // Target comment element
  if ($('.ext_new_comment').length > 0) {
    target = $('.ext_new_comment:first').closest('li.forum-post')

  } else if (last_read.length > 0) {
    target = last_read.prev()

    // Insert the horizontal rule
    $('<hr>').insertAfter(target).attr('id', 'ext_unreaded_hr')

  } else {
    target = $('.topichead').closest('center').eq(lastMsg - 1)

    // Insert the horizontal rule
    $('<hr>').insertAfter(target).attr('id', 'ext_unreaded_hr')
  }

  // Append hr tag content if any
  //var content = $('a#last-read').find('li.forum-post').insertBefore('a#last-read')

  // Remove original hr tag
  last_read.remove()

  // Url to rewrite
  /*var url = document.location.href.replace(/?order=desc&page=\d+/gi, "")*/
  var url = document.location.href.replace(/&newmsg=\d+/gi, "")

  // Update the url to avoid re-jump
  history.replaceState({ page: url }, '', url)

  // Call the jump method with 1 sec delay
  setTimeout(function () {
    jumpUnreadMessages.jump()
  }, 1000)

  // Add click event the manual 'jump to last msg' button
  $('a[href*="#last-read"]').click(function (e) {
    e.preventDefault()
    jumpUnreadMessages.jump()
  })
}


jumpUnreadMessages.jump = () => {

  var hr = $('#ext_unreaded_hr')
  if (!hr) {
    return false
  }

  // Target offsets
  var windowHalf = $(window).height() / 2
  var targetHalf = $(hr).outerHeight() / 2
  var targetTop = $(hr).offset().top
  var targetOffset = targetTop - (windowHalf - targetHalf)

  // Scroll to target element
  $('html, body').animate({ scrollTop: targetOffset }, 400)
}


jumpUnreadMessages.toggle = () => {

  if (PAGE === 1) {
    jumpUnreadMessages.toggleStatus ?
      jumpUnreadMessages.activate() : jumpUnreadMessages.disable()
  }
  else
    jumpUnreadMessages.topic()

}