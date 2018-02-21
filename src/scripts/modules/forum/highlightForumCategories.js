import { Module } from "../module";

export const highlightForumCategories = new Module('highlightForumCategories')

highlightForumCategories.description = 'highlightForumCategories desc'

highlightForumCategories.activate = () => {
  $('nav#favorites-list a.category').css({
    'color': '#ffffff',
    'background-color': '#6c9ff7',
    'padding': '2px'
  });
}

highlightForumCategories.disable = () => {
  $('nav#favorites-list a.category').css({
    'color': '#444',
    'background-color': '#fff',
    'padding': '0px'
  });
}

highlightForumCategories.activated = () => {
  highlightForumCategories.toggle()
}

highlightForumCategories.toggle = () => {

  !highlightForumCategories.toggleStatus ?
    highlightForumCategories.disable() :
    highlightForumCategories.activate()
}