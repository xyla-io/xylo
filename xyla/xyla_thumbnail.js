try {
  if (module.exports !== undefined) {
    var xyla = require('./xyla');
  }
} catch (e) {}

(function() {
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
  xyla.thumbnail.addThumbnailStyles = function(selector) {
    let styleHTML = `
.xyla-creative-images img {
  height: 128px;
  margin: 8px;
}

table.xyla-creative-images {
  margin-top: 16px;
}

.xyla-creative-images td {
  padding-top: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

.xyla-tag {
  float: left;
  margin: 12px;
}

.xyla-tag-image {
  max-height: 144px;
  max-width: 288px;
  margin: 3px;
}

.xyla-tag a {
  border: solid;
  border-width: 5px;
  margin: 3px;
  display: inline-block;
}
  `;
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
  xyla.thumbnail.generateThumbnails = function(selector, queryName, tagColumn, thumbnailURLColumn, linkURLColumn, tagImageMapping) {
    if (!tagImageMapping) {
      tagImageMapping = {};
    }

    function getTags(data) {
      return Array.from(new Set(data.map(row => row[tagColumn])));
    }

    function getURLsForTag(tag, data) {
      let urls = {};
      data.forEach(row => {
        if (row[tagColumn] != tag) { return; }
        let rowHasLinkURL = linkURLColumn !== undefined && row[linkURLColumn] && row[linkURLColumn] !== 'None';
        if (!row[thumbnailURLColumn] && !rowHasLinkURL) { return; }
        if (urls[row[thumbnailURLColumn]] && !rowHasLinkURL) { return; }
        urls[row[thumbnailURLColumn]] = (rowHasLinkURL) ? row[linkURLColumn] : null;
      });
      return Object.keys(urls).map(thumbnailURL => {
        return {
          thumbnailURL: thumbnailURL,
          linkURL: urls[thumbnailURL],
        }
      });
    }

    function insertTagImages() {
      let dataset = xyla.bi.mode.dataSet(queryName);
      if (!dataset) { return; }

      let tagContainer = $(selector);
      tagContainer.html(`
<div class="xyla-tags-container">
  <div class="xyla-tag xyla-template" hidden="true">
    <h4 class="xyla-tag-name"></h4>
    <div class="xyla-tag-images">
      <img class="xyla-tag-image xyla-template" hidden="true">
    </div>
  </div>
</div>
      `);
      let next = tagContainer.next();
      if (next.hasClass('xyla-tags-clear')) {
        next.remove();
      }
      $('<div class="xyla-tags-clear" style="clear: both;"></div>').insertAfter(tagContainer);
      let data = dataset.content;
      getTags(data).forEach(tag => {
        let tagElement = tagContainer.children().children(".xyla-tag.xyla-template").clone();

        tagElement.removeAttr("hidden");
        tagElement.removeClass("xyla-template");
        tagElement.children(".xyla-tag-name").text(tag);

        let tagImagesContainer = tagElement.children(".xyla-tag-images");
        let urls = getURLsForTag(tag, data).filter((_, index) => tagImageMapping[tag] === undefined || tagImageMapping[tag].indexOf(index) !== -1)
        urls.forEach(url => {
          let imageElement = tagImagesContainer.children(".xyla-tag-image.xyla-template").clone();
          imageElement.removeAttr("hidden");
          imageElement.removeClass("xyla-template");
          imageElement.attr("src", url.thumbnailURL);
          if (url.linkURL === null) {
            imageElement.appendTo(tagImagesContainer);
          } else {
            let linkElement = $(`<a target="_blank" href="${url.linkURL}"></a>"`);
            imageElement.appendTo(linkElement);
            linkElement.appendTo(tagImagesContainer);
          }
        });

        tagElement.appendTo(tagContainer);
      });
    }

    $(document).ready(function() {
      insertTagImages();
    });
  };
})();