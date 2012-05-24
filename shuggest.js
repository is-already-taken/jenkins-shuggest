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
	
	var SHELL_SCRIPT_IDX = "/userContent/index.json/*view*/",
		DATA_ATTR_SH_CMD = "data-us-sh-cmd",
		DATA_ATTR_TOOLTIP_ATTACHED = "data-us-attached";
	
	var shuggestData = null;

	function renderItem(item) {
		var path = item.path;

		return '<li><a href="javascript:void(0);" ' + DATA_ATTR_SH_CMD + '="'
				+ item.path + '">' + path + '</a>' + " <span>"
				+ item.description + '</span>'
				+ (item.usage ? 
						' <span class="shuggest-usage" title="'+ item.usage
						+'">[?]</span>' : '')
				+ (item.requires ? 
						' <span class="shuggest-requires" title="'+ item.requires
						+'">[!]</span>' : '')
				+' [<a href="/userContent/' + path
				+ '/*view*/" target="_blank">show</a>]' + '</li>';
	}

	function renderList(list) {
		var s = "<ul>", i;
		for (i = 0; i < list.length; i++) {
			s += renderItem(list[i]);
		}
		return s + "</ul>";
	}
	
	function prepareShellCommand(command){
		return "$JENKINS_HOME/userContent/" + command;
	}
	
	function applyTooltips(){
		// iterating all (shell command) input boxes
		jQuery('textarea[name="command"]')
			.each(function(idx, el) {
				el = jQuery(el);
				
				/* Testing for previously attached tooltip. 
				 * This function is also called by a click handler catching
				 * the new shell command item click.
				 */ 
				if (el.attr(DATA_ATTR_TOOLTIP_ATTACHED) == "true") {
					if (typeof console !== "undefined") {
						console.debug("Shuggest: tooltip already attached to input element.");
					}
					return;
				}
				
				decorate(el);
				
				el.attr(DATA_ATTR_TOOLTIP_ATTACHED, true);
		});
	}

	function decorate(el) {
		var aEl, infoEl = jQuery('<div class="shuggest-tooltip">'
			+ renderList(shuggestData)
			+ '<span class="shuggest-tooltip-close">x</span></div>');

		if (typeof console !== "undefined") {
			console.debug("Shuggest: decorating textarea el", el, renderList(shuggestData));
		}

		el.parent().append(infoEl);
		el.bind("focus", function() {
			infoEl.show();
		});

		aEl = infoEl.find("a[" + DATA_ATTR_SH_CMD + "]");
		aEl.click(function() {
			var linkEl = jQuery(this), textEl, shellCommand;
			
			// get textarea next to tooltip's element
			textEl = linkEl
				.parents("td.setting-main")
				.find("textarea");
					
			shellCommand = prepareShellCommand(
				linkEl.attr(DATA_ATTR_SH_CMD)
			);

			if (typeof console !== "undefined") {
				console.debug("Shuggest: clicked command link", linkEl, textEl, shellCommand);
			}

			textEl[0].value = textEl[0].value + "\n" + shellCommand;
		});

		infoEl.children(".shuggest-tooltip-close")
			.click(function() {
				infoEl.hide();
			});
	}

	// load shell script index
	jQuery.ajax({
		url : SHELL_SCRIPT_IDX,
		success : function(data) {
			shuggestData = eval("(" + data + ")");
			
			if (typeof console !== "undefined") {
				console.debug("Shuggest: loaded Shuggest data", shuggestData);
			}
			
			applyTooltips();
		}
	});
	
	// monitor click on "new command" items
	jQuery("body").click(function(e){
		var item;
		
		if (e.target.nodeName !== "A") {
	        return;
	    }
		
	    item = jQuery(e.originalTarget);
	    
	    if (item.hasClass("yuimenuitemlabel-selected")) {
	    	if (typeof console !== "undefined") {
	    		console.debug("Shuggest: clicked item in Add XYZ-Step Menu");
	    	}
	        
	        window.setTimeout(function(){
	        	applyTooltips();
	        },1000);
	    }
	});

})();
