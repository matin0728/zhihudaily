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
            toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
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

















