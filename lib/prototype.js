 String.prototype.like = function matchRuleShort(rule) {
     return new RegExp("^" + rule.split("*").join(".*") + "$").test(this);
 }