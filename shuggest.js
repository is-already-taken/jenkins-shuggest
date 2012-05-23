/**
 * Shuggest - Display file suggestions of the Jenkins userContent directory 
 *            next to shell command textareas.
 * 
 * This is intended to be used as userscript or "Page Markup" 
 * (see the identically named Jenkins plugin) script.
 * 
 * Requires
 * - jQuery 1.4.2 or higher
 * - shuggest.css
 * - index.json in userContent/ in the following format 
 *   (Can be generated with index-usercontent.sh)
 * 	 ```[{path: "path/to/script.sh", description: "Short description"}, ...]```
 *
 * 
 * @author Thomas Lehmann, May 2012
 * @licence MIT
 * 
 */
(function() {
	var DATA_ATTR_NAME = "data-us-sh-command";

	function renderItem(item) {
		var path = item.path;

		return '<li><a href="javascript:void(0);" ' + DATA_ATTR_NAME + '="'
				+ item.path + '">' + path + '</a>' + " <span>"
				+ item.description + '</span>'
				+ (item.usage ? 
						' <span class="shuggest-usage" title="'+ item.usage
						+'">[?]</span>' : '')
				+' [<a href="/userContent/' + path
				+ '/*view*/" target="_blank">show</a>]' + '</li>';
	}

	function renderList(list) {
		var s = "<ul>", i;
		for (i = 0; i < list.length; i++) {
			// console.debug(list[i]);
			s += renderItem(list[i]);
		}
		return s + "</ul>";
	}
	
	function prepareShellCommand(command){
		return "$JENKINS_HOME/userContent/" + command;
	}

	function decorate(list) {
		jQuery('textarea[name="command"]')
				.each(function(idx, el) {
					el = jQuery(el);
					
					var aEl, infoEl = jQuery('<div class="shuggest-tooltip">'
						+ renderList(list)
						+ '<span class="shuggest-tooltip-close">x</span></div>');

					console.debug("textarea", el, renderList(list));

					el.parent().append(infoEl);
					el.bind("focus", function() {
						infoEl.show();
					});

					aEl = infoEl.find("a[" + DATA_ATTR_NAME + "]");
					aEl.click(function() {
						var linkEl = jQuery(this), textEl, shellCommand;
						
						// get textarea next to tooltip's element
						textEl = linkEl
							.parents("td.setting-main")
							.find("textarea");
								
						shellCommand = prepareShellCommand(
							linkEl.attr(DATA_ATTR_NAME)
						);

						console.debug(linkEl, textEl, shellCommand);

						textEl[0].value = textEl[0].value + "\n" + shellCommand;
					});

					infoEl.children(".shuggest-tooltip-close")
						.click(function() {
							infoEl.hide();
						});
				});
	}

	jQuery.ajax({
		url : "/userContent/index.json/*view*/",
		success : function(data) {
			data = eval("(" + data + ")");
			console.debug(data);
			decorate(data);
		}
	});

})();
