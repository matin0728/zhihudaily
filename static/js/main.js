$.widget( "custom.slideCropper", {
      // default options
      options: {
        minSize: [100, 100],  //cropped width.
        maxSize: [100, 100], //cropped height.
        source: null,
        originWidth: 100,  //origin image size :width, height 
        originHeight: 100,
        selectionCallback: null
      },
 
      // the constructor
      _create: function() {
        this.message_ = $('<div>').appendTo( this.element );
          
        this.slider_ = $('<div>').css('width', '200px').appendTo( this.element ).slider({
            max: 100,
            min: 0,
            value: 100
        });
        
        this._on(this.slider_, {
           slidechange:  'onResizeRateChange_' 
        });
          
        this.setResizeRate(100);
        
      },
    
      onResizeRateChange_ : function(e, ui) {
          //TODO
          this.setResizeRate(ui.value);
      },
      
      setResizeRate : function(rate){
          this.message_.html('ResizeRate: ' + rate + '%');
          
          if(this.reInitJcropTimout){
              clearTimeout(this.reInitJcropTimout);
          }
      
          this.reInitJcropTimout = setTimeout(this.reInitJcrop.bind(this, rate), 500);
          
      },
      
      reInitJcrop : function(rate){
          if(this.jcrop_){
              this.jcrop_.destroy();
          }
          
          if(this.sourceEl_){
              this.sourceEl_.remove();
          }
          
          var w = Math.floor(this.options.originWidth * rate / 100),
              h = Math.floor(this.options.originHeight * rate / 100);
              
          // console.log('New width' + w + ', new height: ' + h );
          
          this.sourceEl_ = $('<img />').appendTo( this.element ).width(w + 'px').height(h + 'px').attr('src', this.options.source);

          this.jcrop_ = $.Jcrop(this.sourceEl_, {
              onChange: $.proxy(this.showPreview, this),
              allowSelect: false
          });
          
          
          if(w > this.options.minSize[0]){
                this.jcrop_.setOptions({minSize: this.options.minSize, maxSize: this.options.maxSize});
              
                this.jcrop_.setSelect([0, 0, this.options.minSize[0], this.options.minSize[1]]);
           }else{
                this.jcrop_.setSelect([0, 0, 100, 100]);
           }
           
           this.jcrop_.focus();
           // this.showPreview();
           
      },
      
      onConfirm_: function(e){
  
          var selection_ = this.jcrop_.tellScaled();
          var scaleRate = this.slider_.slider('value');
          if(this.options.selectionCallback){
             this.options.selectionCallback(selection_, scaleRate, this.options.source); 
          }
          
          //return false to prevent form to be submited.
          return false;
      },
      
      showPreview: function(coords){
          //build preview image.
             if(this.previewImage_){
                 this.previewImage_.remove();
             }else{
                 //First time, create a button.
                 $('<button>').text('确定').button().appendTo(this.element).on('click', $.proxy(this.onConfirm_, this));
             }
            
            var currentSelection = coords;
             // var currentSelection = this.jcrop_.tellScaled();

             var h = currentSelection.h;
             // if(currentSelection.h < this.options.minSize[1]){
             //     h = this.options.minSize[1];
             // }else 

             if(h > this.options.maxSize[1]){
                    h = this.options.maxSize[1];
             }

             // debugger;

             var preview = $('<div class="image-cropper-preivew"></div>').width(currentSelection.w + 'px').height(h + 'px');

             var previewImage = $('<img class="image-cropper-preview-image">').attr('src', this.options.source).appendTo(preview);

             this.previewImage_ = preview;
             this.element.find('.jcrop-holder').after(preview);

             previewImage.css('margin-left', -currentSelection.x + 'px').css('margin-top', -currentSelection.y + 'px');
             
             
      },
      
      
      // called when created, and later when changing options
      // _refresh: function() {
      //   this.element.css( "background-color", "rgb(" +
      //     this.options.red +"," +
      //     this.options.green + "," +
      //     this.options.blue + ")"
      //   );
      //  
      //   // trigger a callback/event
      //   this._trigger( "change" );
      // },
 
      // // a public method to change the color to a random value
      // // can be called directly via .colorize( "random" )
      // random: function( event ) {
      //   var colors = {
      //     red: Math.floor( Math.random() * 256 ),
      //     green: Math.floor( Math.random() * 256 ),
      //     blue: Math.floor( Math.random() * 256 )
      //   };
      //  
      //   // trigger an event, check if it's canceled
      //   if ( this._trigger( "random", event, colors ) !== false ) {
      //     this.option( colors );
      //   }
      // },
 
      // events bound via _on are removed automatically
      // revert other modifications here
      _destroy: function() {
        // remove generated elements
        this.element.remove();
      },
 
      // _setOptions is called with a hash of all options that are changing
      // always refresh when changing options
      // _setOptions: function() {
      //   // _super and _superApply handle keeping the right this-context
      //   this._superApply( arguments );
      //   this._refresh();
      // },
 
      // _setOption is called for each individual option that is changing
      // _setOption: function( key, value ) {
      //   // prevent invalid color values
      //   if ( /red|green|blue/.test(key) && (value < 0 || value > 255) ) {
      //     return;
      //   }
      //   this._super( key, value );
      // }
    });


var imageCropper = function(inputField, refDomElement, minSize, maxSize, opt_postUrl){
    this.inputField_ = inputField;
    //We will generate widget element after this element.
    this.refDomElement_ = refDomElement;
    
    this.previewImage_ = null;
    
    this.slideCropper_ = null;
    
    this.minSize_ = minSize;
    
    this.maxSize_ = maxSize;
    
    this.postUrl = opt_postUrl || '/resize_image';
    
    this.domHtml_ = '<div class="image-cropper"><input class="image-cropper-input-file" type="file" name="files[]" data-url="/image_upload" /><div class="result"></div></div>';
    
    this.init();
};

imageCropper.prototype.init = function(){
    this.domElement_ = $(this.domHtml_);
    $(this.refDomElement_).after(this.domElement_);
    var tmpTarget = this.domElement_.find('.result');    
    var that = this;
    $(this.domElement_).find('.image-cropper-input-file').fileupload({
            dataType: 'json',
            done: function (e, data) {
                $.each(data.result.files, function (index, file) {
                    that.onImageChange(file.name, file.width, file.height);

                });
            }
        });
};

imageCropper.prototype.onImageChange = function(imageSrc, imageWidth, imageHeight){

    if(this.slideCropper_){
        this.slideCropper_.destroy();
    }
    
    var slideCropperDom = $('<div>');
    $(this.refDomElement_).after(slideCropperDom);
    
    var opt = {
        minSize: this.minSize_,
        maxSize: this.maxSize_,
        source: imageSrc,
        originWidth: imageWidth, 
        originHeight: imageHeight,
        selectionCallback: $.proxy(this.onSelection, this)
    }
    //to get the instance, using 'data' method
    this.slideCropper_ = $(slideCropperDom).slideCropper(opt).data('custom-slideCropper');
    
    
    // this.slideCropper_ = $(slideCropperDom).data('custom-slideCropper');
};

imageCropper.prototype.onSelection = function(selectionValue, rate, source){
    // console.log('s: '+ selectionValue);
    // console.log('r: ' + rate);
    
    $.post(this.postUrl, { data : JSON.stringify({axis : selectionValue, rate: rate, source: source})}, $.proxy(this.afterResize, this));
};

imageCropper.prototype.afterResize = function(file){
    //data is a json object.
    this.onImageChange(file.name, file.width, file.height);
};



var getCount = function(txt){
    if(!txt){
        return 0;
    }
    txt = txt.replace(/^\s+/,'').replace(/\s+$/,'');

        if (!txt) {
            return 0;
        }

        //count new line marker as 1 charactor:replace(/\n/g, "a")
        var count = Math.ceil(txt.replace(/(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g,
            "aaaaaaaaaaaaaaaaaaaa")
            //.replace(/\s{2,}/g, "aa")
            .replace(/\n/g, "a")
            .replace(/\s/g, "a")
            .replace(/[\u3000-\u303F\u4E00-\u9FA5\uf900-\ufa2d\uFF00-\uFFEF]/g, "aa").length / 2);
            
    return count;
}

var CharactorCounter = function(el, targetEl){
    this.$el = $(el);
    this.targetEl_ = $(targetEl);
    this.checkCount = function(){
        var txt = this.$el.val();
        var count = getCount(txt);
                
         $(this.targetEl_).html(count);
    };
    
    this.$el.bind('keyup click blur focus change paste', $.proxy(this.checkCount, this)).trigger('click');
};


var newsId;

var DragSorter = function(itemSelector){
    var items = $(itemSelector).attr('draggable', 'true'), placeholder, dragTarget;

    $(itemSelector).on('dragstart', function(e){
        this.style.opacity = '0.4';
        if(!placeholder){
            placeholder = $('<li class="drag-sorter-placeholder"></li>');
        }

        dragTarget = this;

    }).on('dragend', function(e){
        if(placeholder){
            this.style.opacity = '1';
            $(placeholder).after(this).remove();
            dragTarget = null;
        }
        //prevent the event to bubble to question dragger.
        e.stopPropagation();
    }).on('dragenter', function(e){

        if(placeholder && dragTarget){
            $(this).before($(placeholder));
            // if(this != dragTarget){
            //     $(this).before($(placeholder));
            // }
        }else{
            return false;
        }
    });
};

var NewsQuestionGroup = function(jsonData){
    this.jsonData_ = jsonData;
};

NewsQuestionGroup.prototype.appendTo = function(container){
    if(!this.element_){
        this.element_ = this.createDom().appendTo(container);
    }
    return this;
};

var questionPlaceHolder, questionDragTarget;

NewsQuestionGroup.prototype.createDom = function(){
    this.element_ = $('<div class="question '+ this.jsonData_.visibility+'" draggable="true" data-ddgroup="question" data-questionid="' + this.jsonData_.question_id + '"><h3><a class="remove remove-question" data-action="remove-question" href="javascript:;">Remove</a><a class="edit" href="/question/'+this.jsonData_.question_id+'/edit">Edit</a><a class="edit" data-action="visibility">Visibility</a>'+ this.jsonData_.question_title +'</h3></div>');
    this.answersWrap_ = $('<ul></ul>').appendTo(this.element_);
    this.jsonData_.answers.forEach(function(answerDataJson){
        this.createAnswerEntry_(answerDataJson);
    }, this);

    $(this.element_).on('click', $.proxy(function(e){
        var action = $(e.target).attr('data-action');

        if(action == 'remove-answer' || action == 'answer-visibility'){
            var $answerDom = $(e.target).parents('li');
            var questionDom = $($answerDom).parents('.question');

            var answer_id = $answerDom.attr('data-answerid');
            var question_id = $(questionDom).attr('data-questionid');

            e.stopPropagation();
        }

        if(action == 'remove-answer'){
            if(confirm('确定删除答案吗？')){

                //console.log('Remove answer.');

                var answerArray = [];
                this.jsonData_.answers.forEach(function(answerDataJson){
                    if(answerDataJson.answer_id != answer_id){
                        answerArray.push(answerDataJson);
                    }
                }, this);

                this.jsonData_.answers = answerArray;
                $answerDom.remove();

                $.post('/news/delete_answer', {'question_id':question_id, 'answer_id':answer_id});

            }
        }else if(action == 'answer-visibility'){
            if($($answerDom).hasClass('hidden')){
               $($answerDom).removeClass('hidden');
               $.post('/answer/'+answer_id+'/visible', {'visible':'visible', 'question_id':question_id});
            }else{
                $($answerDom).addClass('hidden');
                $.post('/answer/'+answer_id+'/visible', {'visible':'hidden', 'question_id':question_id});
            }
        }
    }, this)).on('dragstart', function(e){
            e.target.style.opacity = '0.4';
            if(!questionPlaceHolder){
                questionPlaceHolder = $('<div class="question drag-sorter-placeholder"></div>');
            }

            if(!$(e.target).hasClass('.question')){
                questionDragTarget = e.target;
            }else{
                questionDragTarget = $(e.target).parents('.question').get(0);;
            }


            //prevent this event bubble up to question group.
            e.stopPropagation();
            // e.preventDefault();
            // return false;
        }).on('dragend', function(e){
                var t = e.target;
                if(t.tagName !== 'LI'){
                    if(!$(e.target).hasClass('question')){
                        t = $(e.target).parents('.question').get(0);
                    }

                    t.style.opacity = '1';
                    if(questionPlaceHolder){
                        $(questionPlaceHolder).after($(t)).remove();
                    }
                    questionDragTarget = null;
                }

            }).on('dragenter', function(e){
                var t = e.target;
                if(!$(e.target).hasClass('question')){
                    t = $(e.target).parents('.question').get(0);;
                }

                if(questionPlaceHolder && $(t).attr('data-ddgroup') == $(questionDragTarget).attr('data-ddgroup')){
                    $(t).before($(questionPlaceHolder));
                }

            })

    return this.element_;
};

NewsQuestionGroup.prototype.getQuestionId = function(){
    return this.jsonData_.question_id
};

NewsQuestionGroup.prototype.getAnswerIds = function(){
    return this.jsonData_.answers;
};

NewsQuestionGroup.prototype.addAnswerEntry = function(answerDataJson){
    var found = false;
    this.jsonData_.answers.forEach(function(answer){
        if(answer.answer_id == answerDataJson.answer_id){
          found = true;
        }
    }, this);

    if(found){
        return;
    }

    this.createAnswerEntry_(answerDataJson);
};

NewsQuestionGroup.prototype.createAnswerEntry_ = function(answerDataJson){
    // var placeholder = this.placeholder;
    $(['<li class="'+ answerDataJson.visibility+'" draggable="true" data-ddgroup="', this.jsonData_.question_id ,'" data-answerid="', answerDataJson.answer_id, '"><a class="remove remove-answer" data-action="remove-answer" href="javascript:;">Remove</a><a class="edit" href="/answer/'+answerDataJson.answer_id+'/edit">Edit</a><a class="edit" data-action="answer-visibility" href="javascript:;">Visibility</a>', answerDataJson.author, '，',  answerDataJson.summary, '</li>'].join(''))
        .appendTo(this.answersWrap_).on('dragstart', $.proxy(function(e){
            e.target.style.opacity = '0.4';
            if(!this.placeholder){
                this.placeholder = $('<li class="drag-sorter-placeholder"></li>');
            }

            this.dragTarget = e.target;

            //prevent this event bubble up to question group.
            e.stopPropagation();
            // e.preventDefault();
            // return false;
        }, this)).on('dragend', $.proxy(function(e){
                e.target.style.opacity = '1';
                if(this.placeholder){
                    $(this.placeholder).after(e.target).remove();
                }
                this.dragTarget = null;
            }, this)).on('dragenter', $.proxy(function(e){
                if(this.placeholder && $(e.target).attr('data-ddgroup') == $(this.dragTarget).attr('data-ddgroup')){
                    $(e.target).before($(this.placeholder));
                }
            }, this));
};

NewsQuestionGroup.prototype.getOrderJson = function(){
    var ids = [];
    $(this.answersWrap_).find('li').each(function(index, answer){
        ids.push($(answer).attr('data-answerid'));
    });

    return {
        question_id: this.jsonData_.question_id,
        answer_ids: ids
    };
};


// <div class="question">
//     <h3><a class="remove" href="javascript:;">移除</a>前端开发中如何做到页面安全，防止 xss ，csrf 这样的欺骗及伪造？</h3>
//     <ul>
//         <li><a class="remove" href="javascript:;">移除</a>杨帆, 像xss，csrf这样的问题，虽然我觉得应该更多是后端应该考虑的问题....</li>
//         <li><a class="remove" href="javascript:;">移除</a>匿名用户, 上策。找律师告他说骚扰你</li>
//     </ul>
// </div>

var NewsQuestionList = function(wrap, items){
    this.questionGroupSelector_ = '';
    this.answerItemSelector_ = '';
    this.questionGroup_ = {};
    this.data_ = items;
    this.element_ = wrap;
};

NewsQuestionList.prototype.createDom = function(){
    this.data_.forEach(function(itemDataJson){
        this.questionGroup_[itemDataJson.question_id + ''] = new NewsQuestionGroup(itemDataJson).appendTo(this.element_);
    }, this);
};

NewsQuestionList.prototype.getOrderJson = function(){
    var orderData_ = [];
    $(this.element_).find('.question').each($.proxy(function(index, questionGroup){
        var d = this.questionGroup_[$(questionGroup).attr('data-questionid')].getOrderJson();
        orderData_.push(d);
    }, this));

    return orderData_;
};

NewsQuestionList.prototype.addItem = function(data){
    var exists = this.questionGroup_[data.question_id];
    if(exists){
        exists.addAnswerEntry(data.answers[0]);
    }else{
        this.questionGroup_[data.question_id + ''] = new NewsQuestionGroup(data).appendTo(this.element_);
    }
};

NewsQuestionList.prototype.removeQuestion = function(question_id){
    $(this.questionGroup_[question_id].element_).remove();
    this.questionGroup_[question_id] = null;
};


$(function(){
    //News list page and topstory page entry.
    if($('#news-list-page').length){
        //datepicker:
        $('#news-list-date').datepicker({
            dateFormat: 'yymmdd'
        });

        $('#btn-date-selector').click(function(e){
            var val = $('#news-list-date').val();
            if(val){
                window.location.href = '/news/list/' + val;
            }
        });


        new DragSorter('.news_list > .news');

        $('.save-change').click(function(e){
            var sorteOrderData = [];
            $('.news_list > .news').each(function(item){
                sorteOrderData.push($(this).attr('data-itemid'));
            });

            var postUrl = $(this).attr('data-url');
            $.post(postUrl, {'order': sorteOrderData.join(',')}).done(function(){
                alert('操作成功！！');
            });
        });

        //Toggle visible button.
        $('#news-list').click(function(e){
            var action = $(e.target).attr('data-action');

            var item = $(e.target).parents('li');

            var id_ = $(e.target).parents('li').attr('data-itemid');


            if(action == 'remove'){
                // $(item).remove();
                if(confirm('确定删除新闻吗？')){
                    $(item).remove();
                    $.post('/news/'+id_+'/delete');
                    // $.post('/news/'+id_+'/remove', function(){
                    //       $(item).remove();
                    //   });
                }

            }else if(action == 'visibility'){

                // if($(item).hasClass('hidden')){
                //     $(item).removeClass('hidden').addClass('public');
                // }else{
                //     $(item).removeClass('public').addClass('hidden');
                // }

                var visibility;
                if($(item).hasClass('hidden')){
                    $(item).removeClass('hidden').addClass('public');
                    visibility = 'visible';
                }else{
                    $(item).removeClass('public').addClass('hidden');
                    visibility = 'hidden';
                }

                $.post('/news/'+id_+'/visible', {'visible':visibility});
            }
        });

    }


    //news edit page.
    if($('#news-edit-page').length){
        
        //Init image cropper
        
        //var imageCropper = function(inputField, refDomElement, minSize, maxSize, postUrl){
        new imageCropper($('#image'), $('#image').parent().eq(0), [640, 400], [640, 1000]);
        new imageCropper($('#thumbnail'), $('#thumbnail').parent().eq(0), [130, 130], [130, 130]);
        
        //end for image cropper
        
        
        $('#publish_time').datetimepicker({
            dateFormat: 'yy-mm-dd'
        });


        $('#content').tinymce({
            script_url : '/static/js/tinymce/tinymce.min.js',
            plugins: [
                    "advlist autolink lists link image charmap print preview hr anchor pagebreak",
                    "searchreplace wordcount visualblocks visualchars code fullscreen",
                    "insertdatetime nonbreaking save table contextmenu directionality",
                    "paste"
                ],
            toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
        });
    }

    //news questions and answers
    //newsId is a global value.
    newsId = $('#news-id').val();

    if($('#news-question-page').length){
        var questionList = new NewsQuestionList($('#qeustion-list'), NewsQestionList);
        questionList.createDom();

        $('#qeustion-list').on('click', function(e){
            var action = $(e.target).attr('data-action');

            if(action == 'remove-question' || action == 'visibility'){
                var question_id = $(e.target).parents('.question').attr('data-questionid');

            }

            if(action == 'remove-question'){
                //console.log('Remove question.');
                if(confirm('删除问题吗？')){
                    questionList.removeQuestion(question_id);
                    $.post('/news/' +newsId+'/question/'+ question_id + '/delete');
                }

            }else if(action == 'visibility'){

                var questionDom = $(e.target).parents('.question');

                if($(questionDom).hasClass('hidden')){
                   $(questionDom).removeClass('hidden');
                   $.post('/question/'+ question_id + '/visible', {'visible':'visible'});
                }else{
                   $(questionDom).addClass('hidden');
                   $.post('/question/'+ question_id + '/visible', {'visible':'hidden'});
                }

            }
        });

        $('#btn-save').click(function(){
            var url = $(this).attr('data-url');
            $.post(url, {order: JSON.stringify(questionList.getOrderJson())}, function(){
                //refresh page.
                window.location.reload();
            });
            //console.log(questionList.getOrderJson());
        });

        //Add item button.
        $('#btn-add-item').click(function(){
            var resourceUrl = $('#item-to-add').val();
            if(resourceUrl){

                //For test
               // questionList.addItem({
               //     'question_id': 'new_questin',
               //     'question_title': 'Some question, andded!',
               //     'answers': [
               //          {
               //              'answer_id': 'aa1',
               //              'author': 'matxxx',
               //              'summary': 'This is answer summary.'
               //          }
               //     ]
               // });

                //For production.
                var url = $(this).attr('data-url');
                $.post(url, {'resource':resourceUrl}, function(data){
                    questionList.addItem(data);
                });
            }
        });
    }

});

















