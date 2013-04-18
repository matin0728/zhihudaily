var DragSorter = function(itemSelector){
    var items = $(itemSelector).attr('draggable', 'True'), placeholder, dragTarget;

    $(itemSelector).on('dragstart', function(e){
        this.style.opacity = '0.4';
        if(!placeholder){
            placeholder = $('<li class="drag-sorter-placeholder"></li>');
        }
        
        dragTarget = this;
        
    }).on('dragend', function(e){
        this.style.opacity = '1';
        if(placeholder){
            $(placeholder).after(this).remove();
        }
        dragTarget = null;
    }).on('dragenter', function(e){
        if(placeholder){
            if(this != dragTarget){
                $(this).before($(placeholder));
            }
        }
    });
};

$(function(){
    //News list page entry.
    if($('#news-list-page').length){
        new DragSorter('.news_list > .news');
    }
    
    $('.save-change').click(function(e){
        var sorteOrderData = [];
        $('.news_list > .news').each(function(item){
            sorteOrderData.push($(this).attr('data-itemid'));
        });
        
        var postUrl = $(this).attr('data-url');
        $.post(postUrl, {'order': sorteOrderData.join(',')}).done(function(){
            alert('操作成功！！');
        });
        // console.log(sorteOrderData.join(','));
    });
    
});