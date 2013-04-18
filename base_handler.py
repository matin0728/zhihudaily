import webapp2
import jinja2
import os
from google.appengine.api import users

jinja_environment = jinja2.Environment(
  loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__) + '/templates')))


class BaseHandler(webapp2.RequestHandler):
    
  # @webapp2.cached_property
  # def get_template_environment(self):
  #   jinja_environment = jinja2.Environment(
  #     loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__) + '/../templates')))
  #   return jinja_environment
    
  def output_ajax_response(self, response):
    self.response.headers.add_header("Content-Type", "application/json")
    self.response.out.write(response.get_json())
  
  def set_error(self, error):
    #TODO: Complete this method
    # in_ajax = 'inajax' in self.request.headers.keys()
    # if in_ajax:
    #   pass
      
    self.response.out.write('{"r":1, "msg":"Server error."}')
  
  def render(self, template, context=None):
    context = context or {}
    
    page_header = self.render_template('header.html')
    page_footer = self.render_template('footer.html')
    sidebar = self.render_template('sidebar.html')

    extra_context = {
      'render_page_header': page_header,
      'render_page_footer': page_footer,
      'render_sidebar': sidebar
    }

    for key, value in extra_context.items():
      if key not in context:
        context[key] = value
    
    # env = self.get_template_environment()
    template = jinja_environment.get_template(template)
    self.response.out.write(template.render(context))
  
  def render_template(self, template, context = {}):
    template = jinja_environment.get_template(template)
    return template.render(context)
    

    
