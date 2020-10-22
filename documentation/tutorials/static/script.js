
var sheet = document.createElement('style')
sheet.innerHTML = ("")

$('pre:has(code)').each(function(){

    //using the XBrowser function from http://stackoverflow.com/questions/985272/
    function selectText(element) {
        var doc = document
            , text = element
            , range, selection
        ;    
        if (doc.body.createTextRange) { //ms
            range = doc.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) { //all others
            selection = window.getSelection();        
            range = doc.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        document.execCommand('copy');
    }

    var input = $("<input type='button' value='Copy Snippet'/>"),
        that = this;
    input.click(function(){
        selectText($('code',that)[0]);
    });
    $(this).after(input);
});
