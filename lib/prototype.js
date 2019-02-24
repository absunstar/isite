 String.prototype.like = function matchRuleShort(rule) {
     try {
        return new RegExp("^" + rule.split("*").join(".*") + "$").test(this);
     } catch (error) {
         return false
     }
 }

 String.prototype.contains = function (name) {
    return this.like('*' + name + '*')
}