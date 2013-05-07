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
import json

class ImageUploadHandler(base_handler.BaseHandler):
  def post(self):
    #image_file = self.request.get('files')
    self.response.headers.add_header("Content-Type", "application/json")
    self.response.out.write(json.dumps({'files':[{'name':'http://p3.zhimg.com/b1/a0/b1a09e0425d8f0977a125d2fc3c2f9e5_m.jpg'}]}))
    

class MainHandler(base_handler.BaseHandler):
    def get(self):
      news = [
        { 'id': 123, 'status': 'public', 'title': 'Some title', 'is_topstory': True, 'pushed': False},
        { 'id': 456, 'status': 'public', 'title': 'Some title', 'is_topstory': False, 'pushed': False},
        { 'id': 789, 'status': 'hidden', 'title': 'Hidden news', 'is_topstory': False, 'pushed': False},
        { 'id': 112233, 'status': 'updated', 'title': 'Updated news', 'is_topstory': False, 'pushed': True},
        { 'id': 334455, 'status': 'public', 'title': 'Some title', 'is_topstory': False, 'pushed': False}
      ]
      context = { 
        'current_date':'2013-04-19',
        'link_for_previous_day':'/news/2013-04-18',
        'link_for_next_day':'/news/2013-04-20',
        'url_for_save_change': 'ajax-post-url',
        'url_for_publish': 'ajax-post-url',
        'news' : news, 
        # 'question': {},
        # 'answer': {},
      }
      self.render('index.html', context)
      # self.render('news_question_edit.html', context)
      # self.render('news_answer_edit.html', context)
      
      
class TopStoryHandler(base_handler.BaseHandler):
    def get(self):
      news = [
        { 'id': 123, 'status': 'public', 'title': 'Some title', 'is_topstory': True},
        { 'id': 456, 'status': 'public', 'title': 'Some title', 'is_topstory': True},
        { 'id': 789, 'status': 'hidden', 'title': 'Hidden news', 'is_topstory': True},
        { 'id': 112233, 'status': 'updated', 'title': 'Updated news', 'is_topstory': True},
        { 'id': 334455, 'status': 'public', 'title': 'Some title', 'is_topstory': True}
      ]
      context = { 
        'url_for_publish': 'ajax-post-url',
        'news' : news, 
      }
      self.render('top_story.html', context)
      
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
      
class NewsPushHandler(base_handler.BaseHandler):
    def get(self, news_id):    
      context = {
        'news': {}
      }
      self.render('news_push.html', context)      

            
class NewsQuestionAndAnswerHandler(base_handler.BaseHandler):
    def get(self, news_id):
      question_list_json = [
        {
          'question_id': 123, 
          'question_title':'aaaaaaaaa',
          'visibility': '',
          'answers':[
            {
              'answer_id': 'a1',
              'author': 'Jhon',
              'summary': 'ddsfsdfsdf',
              'visibility': 'hidden'
            },
            {
              'answer_id': 'b1',
              'author': 'Tomy',
              'summary': 'frgdfdfdffd',
              'visibility': ''
            },
            {
              'answer_id': 'c1',
              'author': 'LadyGaga',
              'summary': 'frgdfdfdffd',
              'visibility': ''
            }
          
          ]},
          {
            'question_id': 234, 
            'question_title':'It is too late to say apologize.',
            'visibility': '',
            'answers':[
              {
                'answer_id': 'a1',
                'author': 'Jhon',
                'summary': 'ddsfsdfsdf',
                'visibility': ''
              },
              {
                'answer_id': 'b1',
                'author': 'Tomy',
                'summary': 'frgdfdfdffd',
                'visibility': ''
              },
              {
                'answer_id': 'c1',
                'author': 'LadyGaga',
                'summary': 'frgdfdfdffd',
                'visibility': 'hidden'
              }

            ]}
      
      ]    
      context = {
        'news': {'id': 123, 'title':'[Title for news]'},
        'get_item_json_url': '', # Path for retrive question and answer json object.
        'question_list_json': json.dumps(question_list_json)
      }
      self.render('news_q_and_a.html', context)

app = webapp2.WSGIApplication([
  webapp2.Route(r'/', handler=MainHandler, name='index'),
  webapp2.Route(r'/news/<news_id:\d+>/edit', handler=NewsEditHandler, name='news.edit'),
  webapp2.Route(r'/news/<news_id:\d+>/q_and_a', handler=NewsQuestionAndAnswerHandler, name='news.q_and_a'),
  webapp2.Route(r'/news/<news_id:\d+>/push', handler=NewsPushHandler, name='news.push'),
  
  webapp2.Route(r'/news/create', handler=NewsCreateHandler, name='news.edit'),
  webapp2.Route(r'/news/topstory', handler=TopStoryHandler, name='news.topstory'),
  webapp2.Route(r'/image_upload', handler=ImageUploadHandler, name='imageupload'),
  
], debug=True)
