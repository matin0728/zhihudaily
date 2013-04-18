#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import base_handler

class MainHandler(base_handler.BaseHandler):
    def get(self):
      news = [
        { 'id': 123, 'status': 'public', 'title': 'Some title'},
        { 'id': 456, 'status': 'public', 'title': 'Some title'},
        { 'id': 789, 'status': 'hidden', 'title': 'Hidden news'},
        { 'id': 112233, 'status': 'updated', 'title': 'Updated news'},
        { 'id': 334455, 'status': 'public', 'title': 'Some title'}
      ]
      context = { 
        'current_date':'2013-04-19',
        'link_for_previous_day':'/news/2013-04-18',
        'link_for_next_day':'/news/2013-04-20',
        'url_for_save_change': 'ajax-post-url',
        'url_for_publish': 'ajax-post-url',
        'news' : news, 
      }
      self.render('index.html', context)
      
class NewsEditHandler(base_handler.BaseHandler):
    def get(self, news_id):    
      context = {
        'is_edit': True,
        'news': { 'id': 123, 'title': 'This is title.'}
      }
      self.render('news_edit.html', context)

class NewsCreateHandler(base_handler.BaseHandler):
    def get(self):    
      context = {
        'is_edit': False,
        'news': {}
      }
      self.render('news_edit.html', context)
            
class NewsQuestionAndAnswerHandler(base_handler.BaseHandler):
    def get(self, news_id):    
      context = {
        'news': {'id': 123, 'title':'[Title for news]'}
      }
      self.render('news_q_and_a.html', context)

app = webapp2.WSGIApplication([
  webapp2.Route(r'/', handler=MainHandler, name='index'),
  webapp2.Route(r'/news/<news_id:\d+>/edit', handler=NewsEditHandler, name='news.edit'),
  webapp2.Route(r'/news/<news_id:\d+>/q_and_a', handler=NewsQuestionAndAnswerHandler, name='news.q_and_a'),
  webapp2.Route(r'/news/create', handler=NewsCreateHandler, name='news.edit'),
], debug=True)
