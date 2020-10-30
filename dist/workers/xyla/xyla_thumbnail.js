try {
    if (module.exports !== undefined) {
        var xyla = require('./xyla');
    }
}
catch (e) { }
(function () {
    /**
     * Functions for generating thumbnail previews.
     * @namespace
     */
    xyla.thumbnail = {};
    /**
     * Inserts CSS rules for styling generated thumbnails.
     *
     * See also {@link #xylageneratethumbnails generateThumbnails}
     *
     * @param {string} selector a jQuery selector to target the `<style>` tag into which the rules should be inserted.
     * @example
     * // A <style class="xyla-styles"></style> element should exist in the HTML
     * xyla.thumbnail.addThumbnailStyles('.xyla-styles');
     */
    xyla.thumbnail.addThumbnailStyles = function (selector) {
        var styleHTML = "\n.xyla-creative-images img {\n  height: 128px;\n  margin: 8px;\n}\n\ntable.xyla-creative-images {\n  margin-top: 16px;\n}\n\n.xyla-creative-images td {\n  padding-top: 8px;\n  padding-left: 8px;\n  padding-right: 8px;\n}\n\n.xyla-tag {\n  float: left;\n  margin: 12px;\n}\n\n.xyla-tag-image {\n  max-height: 144px;\n  max-width: 288px;\n  margin: 3px;\n}\n\n.xyla-tag a {\n  border: solid;\n  border-width: 5px;\n  margin: 3px;\n  display: inline-block;\n}\n  ";
        $(selector).html(styleHTML);
    };
    /**
     * Generates thumbnail previews within a specified HTML container element
     *
     * See also {@link #xylaaddthumbnailstyles addThumbnailStyles}
     *
     * @param {string} selector a jQuery selector
     * @param {string} queryName the name of the query containing the thumbnail URLs
     * @param {string} tagColumn the name of the tag column
     * @param {string} thumbnailURLColumn the name of the column containing the thumbnail URL
     * @param {string} [linkURLColumn] the name of the column containing the URL to which to link the thumbnail
     * @param {object} [tagImageMapping={}] an object with keys corresponding to expected tags and array values containing the indicies of thumbnails to preview. If no key is provided for a tag then all thumbnails will be previewed.
     * @example
     * // generate thumbnails for the Ad Tags query in an element like <div class="xyla-thumbnails"></div>
     * xyla.thumbnail.generateThumbnails('.xyla-thumbnails', 'Tag URLs', 'ad_tag', 'creative_thumbnail_url', 'creative_image_url', {'Installs Optimized': [0, 2]});
     */
    xyla.thumbnail.generateThumbnails = function (selector, queryName, tagColumn, thumbnailURLColumn, linkURLColumn, tagImageMapping) {
        if (!tagImageMapping) {
            tagImageMapping = {};
        }
        function getTags(data) {
            return Array.from(new Set(data.map(function (row) { return row[tagColumn]; })));
        }
        function getURLsForTag(tag, data) {
            var urls = {};
            data.forEach(function (row) {
                if (row[tagColumn] != tag) {
                    return;
                }
                var rowHasLinkURL = linkURLColumn !== undefined && row[linkURLColumn] && row[linkURLColumn] !== 'None';
                if (!row[thumbnailURLColumn] && !rowHasLinkURL) {
                    return;
                }
                if (urls[row[thumbnailURLColumn]] && !rowHasLinkURL) {
                    return;
                }
                urls[row[thumbnailURLColumn]] = (rowHasLinkURL) ? row[linkURLColumn] : null;
            });
            return Object.keys(urls).map(function (thumbnailURL) {
                return {
                    thumbnailURL: thumbnailURL,
                    linkURL: urls[thumbnailURL],
                };
            });
        }
        function insertTagImages() {
            var dataset = xyla.bi.mode.dataSet(queryName);
            if (!dataset) {
                return;
            }
            var tagContainer = $(selector);
            tagContainer.html("\n<div class=\"xyla-tags-container\">\n  <div class=\"xyla-tag xyla-template\" hidden=\"true\">\n    <h4 class=\"xyla-tag-name\"></h4>\n    <div class=\"xyla-tag-images\">\n      <img class=\"xyla-tag-image xyla-template\" hidden=\"true\">\n    </div>\n  </div>\n</div>\n      ");
            var next = tagContainer.next();
            if (next.hasClass('xyla-tags-clear')) {
                next.remove();
            }
            $('<div class="xyla-tags-clear" style="clear: both;"></div>').insertAfter(tagContainer);
            var data = dataset.content;
            getTags(data).forEach(function (tag) {
                var tagElement = tagContainer.children().children(".xyla-tag.xyla-template").clone();
                tagElement.removeAttr("hidden");
                tagElement.removeClass("xyla-template");
                tagElement.children(".xyla-tag-name").text(tag);
                var tagImagesContainer = tagElement.children(".xyla-tag-images");
                var urls = getURLsForTag(tag, data).filter(function (_, index) { return tagImageMapping[tag] === undefined || tagImageMapping[tag].indexOf(index) !== -1; });
                urls.forEach(function (url) {
                    var imageElement = tagImagesContainer.children(".xyla-tag-image.xyla-template").clone();
                    imageElement.removeAttr("hidden");
                    imageElement.removeClass("xyla-template");
                    imageElement.attr("src", url.thumbnailURL);
                    if (url.linkURL === null) {
                        imageElement.appendTo(tagImagesContainer);
                    }
                    else {
                        var linkElement = $("<a target=\"_blank\" href=\"" + url.linkURL + "\"></a>\"");
                        imageElement.appendTo(linkElement);
                        linkElement.appendTo(tagImagesContainer);
                    }
                });
                tagElement.appendTo(tagContainer);
            });
        }
        $(document).ready(function () {
            insertTagImages();
        });
    };
})();
//# sourceMappingURL=xyla_thumbnail.js.map