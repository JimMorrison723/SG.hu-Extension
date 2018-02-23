import { Module } from '../module'
import { userName } from '../../content'

export const highlightCommentsForMe = new Module('highlightCommentsForMe')

highlightCommentsForMe.activate = () => {

  // Return false when no username set
  if (!userName) {
    return false
  }

  // Get the proper domnodes
  var comment = $('li[id*="post"] footer a:contains("' + userName + '")')

  //We need exact match with the userName
  var start_pos = comment.text().indexOf('\'') + 1
  var end_pos = comment.text().indexOf('\'', start_pos)
  var TesTcomment = comment.text().substring(start_pos, end_pos)
  var comments;

  if (TesTcomment === userName) {
    comments = comment.closest('li')
  }

  if (comments !== undefined) {

    // Iterate over them
    comments.each(function () {

      if ($(this).find('.ext_comments_for_me_indicator').length === 0) {

        $(this).css('position', 'relative').append('<img src="' + chrome.extension.getURL('/images/content/comments_for_me_indicator.png') + '" class="ext_comments_for_me_indicator">')

        if (document.location.href.match(/cikkek/)) {
          $(this).find('.ext_comments_for_me_indicator').addClass('article')
        } else {
          $(this).find('.ext_comments_for_me_indicator').addClass('topic')
        }
      }
    });
  }
}

highlightCommentsForMe.disable = () => {

  $('.ext_comments_for_me_indicator').remove();
}

highlightCommentsForMe.toggle = () => {

  highlightCommentsForMe.toggleStatus ?
    highlightCommentsForMe.activate() : highlightCommentsForMe.disable()
}