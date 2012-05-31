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

	function escapeHtml(str){
		return str.replace(/"/g, "&quot;").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	
	function renderDetail(str, cls){
		if (str) {
			return '<div class="shuggest-detail shuggest-'
				+ cls +'">' 
				+ escapeHtml(str) + '</div>';
		}
		return "";
	}
	
	function renderItem(item) {
		var path = item.path;

		var str =  '<li>'
			+ '<div class="shuggest-overview">'
				+ '<a class="shuggest-script" href="javascript:void(0);" ' + DATA_ATTR_SH_CMD + '="'
				+ path + '">' + path + '</a>'
				+ '<span class="shuggest-descr">'+ escapeHtml(item.description) +'</span>'
				+ '<a class="shuggest-more" href="javascript:void(0);">more ...</a>'
			+ '</div>'
			+ '<div class="shuggest-details">'
				+ '<div class="shuggest-detail shuggest-fulldesc">'
					+ escapeHtml(item.description)
					+' [<a href="/userContent/' + path
					+ '/*view*/" target="_blank">show</a>]'
				+ '</div>'
				+ renderDetail(item.usage, "usage")
				+ renderDetail(item.consumes, "consumes")
				+ renderDetail(item.produces, "produces")
			+ '</div>'
		+ '</li>';
		
		return str;
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
		var aEl, moreEl, infoEl = jQuery('<div class="shuggest-tooltip">'
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
		moreEl = infoEl.find("a.shuggest-more");
		
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
		
		moreEl.click(function(){
			var linkEl = jQuery(this), 
				detailEl = linkEl.parent().next(),
				allDetailEl = linkEl.parents("ul").find(".shuggest-details"),
				isOpen = detailEl.hasClass("shuggest-details-open");
			
			allDetailEl.removeClass("shuggest-details-open");
			
			if (isOpen) {
				return;
			}
			
			detailEl.addClass("shuggest-details-open");
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
