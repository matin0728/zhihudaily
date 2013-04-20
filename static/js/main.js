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
        if(placeholder){
            if(this != dragTarget){
                $(this).before($(placeholder));
            }
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
    this.element_ = $('<div class="question" draggable="true" data-ddgroup="question" data-questionid="' + this.jsonData_.question_id + '"><h3><a class="remove remove-question" href="javascript:;">移除</a>'+ this.jsonData_.question_title +'</h3></div>');
    this.answersWrap_ = $('<ul></ul>').appendTo(this.element_);
    this.jsonData_.answers.forEach(function(answerDataJson){
        this.createAnswerEntry_(answerDataJson);
    }, this);
    
    $(this.element_).on('click', $.proxy(function(e){
        if($(e.target).hasClass('remove-answer')){
            e.stopPropagation();
            //console.log('Remove answer.');
            var $answerDom = $(e.target).parents('li');
            var answer_id = $answerDom.attr('data-answerid');
            var answerArray = [];
            this.jsonData_.answers.forEach(function(answerDataJson){
                if(answerDataJson.answer_id != answer_id){
                    answerArray.push(answerDataJson);
                }
            }, this);
            
            this.jsonData_.answers = answerArray;
            $answerDom.remove();
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
                
                if(questionPlaceHolder && $(t).attr('data-ddgroup') == $(questionDragTarget).attr('data-ddgroup') && t != questionDragTarget){
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
    $(['<li draggable="true" data-ddgroup="', this.jsonData_.question_id ,'" data-answerid="', answerDataJson.answer_id, '"><a class="remove remove-answer" href="javascript:;">移除</a>', answerDataJson.author, '，',  answerDataJson.summary, '</li>'].join(''))
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
                if(this.placeholder && $(e.target).attr('data-ddgroup') == $(this.dragTarget).attr('data-ddgroup') && e.target != this.dragTarget){
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
    //News list page entry.
    if($('#news-list-page').length){
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
        
    }
    
    
    //news edit page.
    if($('#news-edit-page').length){
        $('#content').tinymce({
            script_url : '/static/js/tinymce/tinymce.min.js',
            plugins: [
                    "advlist autolink lists link image charmap print preview hr anchor pagebreak",
                    "searchreplace wordcount visualblocks visualchars code fullscreen",
                    "insertdatetime nonbreaking save table contextmenu directionality",
                    "paste"
                ],
            toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
        });
    }
    
    //news questions and answers
    if($('#news-question-page').length){
        var questionList = new NewsQuestionList($('#qeustion-list'), NewsQestionList);
        questionList.createDom();
        
        $('#qeustion-list').on('click', function(e){
            if($(e.target).hasClass('remove-question')){
                //console.log('Remove question.');
                var question_id = $(e.target).parents('.question').attr('data-questionid');
                questionList.removeQuestion(question_id);
            }
        });
        
        $('#btn-save').click(function(){
            var url = $(this).attr('data-url');
            $.post(url, {order: questionList.getOrderJson()}, function(){
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
                $.get(resourceUrl + '?resource=' + encodeURIComponent(url), function(data){
                    questionList.addItem(data);
                });
            }
        });
    }
    
});

















