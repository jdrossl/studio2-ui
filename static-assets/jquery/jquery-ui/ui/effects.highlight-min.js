(function(a){a.effects.highlight=function(b){return this.queue(function(){var e=a(this),d=["backgroundImage","backgroundColor","opacity"];
var h=a.effects.setMode(e,b.options.mode||"show");
var c=b.options.color||"#ffff99";
var g=e.css("backgroundColor");
a.effects.save(e,d);
e.show();
e.css({backgroundImage:"none",backgroundColor:c});
var f={backgroundColor:g};
if(h=="hide"){f.opacity=0
}e.animate(f,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){if(h=="hide"){e.hide()
}a.effects.restore(e,d);
if(h=="show"&&a.browser.msie){this.style.removeAttribute("filter")
}if(b.callback){b.callback.apply(this,arguments)
}e.dequeue()
}})
})
}
})(jQuery);