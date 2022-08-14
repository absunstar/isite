app.directive('iControl', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      id2: '@',
      label: '@',
      type: '@',
      class2: '@',
      disabled: '@',
      ngModel: '=',
      ngChange: '&',
      ngKeydown: '&',
    },
    link: function ($scope, element, attrs, ctrl) {
      attrs.type = attrs.type || 'text';
      $scope.id2 = $scope.id2 || 'input_' + Math.random().toString().replace('0.', '');

      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }
      $scope.class2 = $scope.class2 || '';
      $(element)
        .find('input')
        .focus(() => {
          $('.i-list .dropdown-content').css('display', 'none');
        });
    },
    template: `
        <div class="mb-3 {{class2}}">
        <label for="{{id2}}" class="form-label">{{label}}</label>
        <input id="{{id2}}" ng-disabled="disabled" autofocus v="{{v}}"  type="{{type}}" ng-model="ngModel" ng-change="ngChange()" ngKeydown="ngKeydown()" class="form-control"  placeholder="{{placeholder}}" aria-label="{{label}}"  />
        <div class="invalid-feedback">
        
        </div>   
        </div>
        `,
  };
});

app.directive('iTextarea', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      label: '@',
      id2: '@',
      disabled: '@',
      rows: '@',
      ngModel: '=',
      ngChange: '&',
    },
    link: function ($scope, element, attrs, ctrl) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }
      $scope.rows = $scope.rows || 4;
      $scope.id2 = $scope.id2 || 'input_' + Math.random().toString().replace('0.', '');
      $(element)
        .find('textarea')
        .focus(() => {
          $('.popup').hide();
        });
    },
    template: `
        <div class="mb-3">
          <label for="{{id2}}" class="form-label">{{label}}</label>
          <textarea ng-disabled="disabled" class="form-control" id="{{id2}}" ng-model="ngModel" ng-change="ngChange()" v="{{v}}" rows="{{rows}}"></textarea>
        </div>
        `,
  };
});

app.directive('iCheckbox', function ($timeout) {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      label: '@',
      id2: '@',
      ngModel: '=',
      ngChange: '&',
    },
    link: function ($scope, element, attrs, ctrl) {
      if (typeof attrs.disabled !== 'undefined') {
        $scope.disabled = 'disabled';
      } else {
        $scope.disabled = '';
      }
      $scope.id2 = $scope.id2 || 'input_' + Math.random().toString().replace('0.', '');
      $scope.changed = function () {
        $timeout(() => {
          if ($scope.ngChange) {
            $scope.ngChange();
          }
        }, 100);
      };
    },
    template: `
        <div class="form-check">
          <input ng-change="changed()" ng-disabled="disabled" class="form-check-input" type="checkbox" ng-model="ngModel" id="{{id2}}">
          <label class="form-check-label" for="{{id2}}">
            {{label}}
          </label>
        </div>
        `,
  };
});

app.directive('iRadio', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      label: '@',
      group: '@',
      id2: '@',
      ngModel: '=',
      ngChange: '&',
    },
    link: function ($scope, element, attrs, ctrl) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      $scope.group = $scope.group || attrs.group || attrs.ngModel.replaceAll('.', '_');
      $scope.id2 = $scope.id2 || 'input_' + Math.random().toString().replace('0.', '');
    },
    template: `
            <div class="form-check">
              <input class="form-check-input" type="radio" ng-change="ngChange()" ng-disabled="disabled" ng-model="ngModel" id="{{id2}}" name="{{group}}" >
              <label class="form-check-label" for="exampleRadios1">
                {{label}}
              </label>
            </div>

        `,
  };
});

app.directive('iButton', function () {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      type: '@',
      loading: '@',
      click: '&',
      fa: '@',
    },
    link: function ($scope, element, attrs, ctrl) {
      $scope.type = $scope.type || '';
      $scope.class = $scope.class = 'btn-dark';
      $scope.fa = $scope.fa || $scope.label ? '' : 'fas fa-play';

      if ($scope.type.like('*add*') || $scope.type.like('*new*')) {
        $scope.fa = 'fas fa-plus';
        $scope.class = 'btn-primary';
      } else if ($scope.type.like('*update*') || $scope.type.like('*edit*')) {
        $scope.fa = 'fas fa-edit';
        $scope.class = 'btn-warning';
      } else if ($scope.type.like('*save*')) {
        $scope.fa = 'fas fa-save';
        $scope.class = 'btn-success';
      } else if ($scope.type.like('*view*') || $scope.type.like('*details*')) {
        $scope.fa = 'fas fa-eye';
        $scope.class = 'btn-info';
      } else if ($scope.type.like('*delete*') || $scope.type.like('*remove*')) {
        $scope.fa = 'fas fa-trash';
        $scope.class = 'btn-danger';
      } else if ($scope.type.like('*exit*') || $scope.type.like('*close*')) {
        $scope.fa = 'fas fa-times-circle';
        $scope.class = 'btn-danger';
      } else if ($scope.type.like('*print*')) {
        $scope.fa = 'fas fa-print';
        $scope.class = 'btn-secondary';
      } else if ($scope.type.like('*search*')) {
        $scope.fa = 'search';
      } else if ($scope.type.like('*export*') || $scope.type.like('*excel*')) {
        $scope.fa = 'fas fa-file-export';
        $scope.class = 'btn-secondary';
      }
      $scope.$watch('loading', (loading) => {
        if (loading === 'true') {
          $scope.busy = true;
        } else {
          $scope.busy = false;
        }
      });
    },
    template: `
        <button class="btn {{class}}" type="button" ng-click="click()" ng-disabled="busy">
          <span ng-show="busy" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {{label}}
          <i class="{{fa}}"></i>
        </button>
        `,
  };
});
app.directive('iList', [
  '$interval',
  '$timeout',
  'isite',
  function ($interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        v: '@',
        label: '@',
        display: '@',
        display2: '@',
        disabled: '@',
        css: '@',
        space: '@',
        primary: '@',
        ngValue: '@',
        ngModel: '=',
        ngSearch: '=',
        ngChange: '&',
        ngAdd: '&',
        items: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        $scope.primary = $scope.primary || 'id';
        $scope.display = $scope.display || 'name';
        $scope.display2 = $scope.display2 || '';
        $scope.space = $scope.space || ' - ';
        attrs.ngValue = attrs.ngValue || '';

        $scope.searchElement = $(element).find('.dropdown .search');
        $scope.popupElement = $(element).find('.dropdown .dropdown-content');

        if (typeof attrs.disabled !== 'undefined') {
          attrs.disabled = 'disabled';
        } else {
          attrs.disabled = '';
        }

        if (typeof attrs.ngAdd == 'undefined') {
          $scope.fa_add = 'fa-search';
        } else {
          $scope.fa_add = 'fa-plus';
        }

        if (typeof attrs.ngSearch == 'undefined') {
          $scope.showSearch = !1;
        } else {
          $scope.showSearch = !0;
        }

        let input = $(element).find('input');
        $(element).hover(
          () => {
            $scope.popupElement.css('display', 'block');
          },
          () => {
            $scope.popupElement.css('display', 'none');
          }
        );
        $scope.focus = function () {
          $('.i-list .dropdown-content').css('display', 'none');
          $scope.popupElement.css('display', 'block');
          $scope.searchElement.focus();
        };
        $scope.hide = function () {
          $scope.popupElement.css('display', 'none');
        };

        $scope.getValue = function (item) {
          let v = isite.getValue(item, $scope.display);
          return v || '';
        };

        $scope.getValue2 = function (item) {
          if ($scope.display2) {
            return isite.getValue(item, $scope.display2) || '';
          }
          return '';
        };

        $scope.getNgModelValue = function (ngModel) {
          if (ngModel && $scope.display && $scope.ngValue) {
            return isite.getValue(ngModel, $scope.display.replace($scope.ngValue + '.', '')) || '';
          } else if (ngModel && $scope.display) {
            return isite.getValue(ngModel, $scope.display) || '';
          }
          return '';
        };

        $scope.getNgModelValue2 = function (ngModel) {
          if (ngModel && $scope.display2 && $scope.ngValue) {
            return isite.getValue(ngModel, $scope.display2.replace($scope.ngValue + '.', '')) || '';
          } else if (ngModel && $scope.display2) {
            return isite.getValue(ngModel, $scope.display2) || '';
          }
          return '';
        };

        $scope.getNgValue = function (item) {
          if (item && $scope.ngValue) {
            return isite.getValue(item, $scope.ngValue);
          }
          return item;
        };

        $scope.$watch('items', (items) => {
          input.val('');

          if (items) {
            items.forEach((item) => {
              if ($scope.display2) {
                item.$display = $scope.getValue(item) + $scope.space + $scope.getValue2(item);
              } else {
                item.$display = $scope.getValue(item);
              }
            });
          }

          if (items && $scope.ngModel) {
            items.forEach((item) => {
              if (isite.getValue(item, $scope.primary) == isite.getValue($scope.ngModel, $scope.primary)) {
                $scope.ngModel = item;
                if ($scope.display2) {
                  item.$display = $scope.getValue(item) + $scope.space + $scope.getValue2(item);
                } else {
                  item.$display = $scope.getValue(item);
                }

                input.val(item.$display);
              }
            });
          }
        });

        $scope.$watch('ngModel', (ngModel) => {
          input.val('');

          $scope.ngModel = ngModel;

          if (ngModel) {
            if ($scope.display2) {
              input.val(' ' + $scope.getNgModelValue(ngModel) + $scope.space + $scope.getNgModelValue2(ngModel));
            } else {
              input.val(' ' + $scope.getNgModelValue(ngModel));
            }
          }
        });

        $scope.updateModel = function (item) {
          $scope.ngModel = $scope.getNgValue(item, $scope.ngValue);
          if ($scope.display2) {
            input.val($scope.getNgModelValue($scope.ngModel) + $scope.space + $scope.getNgModelValue2($scope.ngModel));
          } else {
            input.val($scope.getNgModelValue($scope.ngModel));
          }
          $timeout(() => {
            if ($scope.ngChange) {
              $scope.ngChange();
            }
          }, 100);
          $scope.hide();
        };
      },
      template: `/*##client-side/sub/i-list2.content.html*/`,
    };
  },
]);
app.directive('iChecklist', [
  '$interval',
  '$timeout',
  function ($interval, $timeout) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        label: '@',
        primary: '@',
        display: '@',
        class2: '@',
        ngModel: '=',
        items: '=',
        like: '&',
        ngChange: '&',
      },
      link: function ($scope, element, attrs, ctrl) {
        $scope.primary = $scope.primary || 'id';
        $scope.display = $scope.display || 'name';
        $scope.class2 = $scope.class2 || 'col';
        $scope.selectedItems = [];

        $scope.$watch('ngModel', (ngModel) => {
          $scope.reload();
        });

        $scope.reload = function () {
          $scope.selectedItems = [];

          if ($scope.ngModel) {
            $scope.ngModel.forEach((mitem) => {
              $scope.selectedItems.push(mitem);
            });

            if ($scope.items) {
              $scope.items.forEach((mitem) => {
                let exist = !1;
                $scope.selectedItems.forEach((sitem) => {
                  if (mitem[$scope.primary] === sitem[$scope.primary]) {
                    exist = !0;
                  }
                });
                if (exist) {
                  mitem.$selected = !0;
                } else {
                  mitem.$selected = !1;
                }
              });
            }
          }
          if (!$scope.ngModel) {
            $scope.selectedItems = [];
            if ($scope.items) {
              $scope.items.forEach((mitem) => {
                mitem.$selected = !1;
              });
            }
          }
        };

        $scope.change = function (item) {
          if (item.$selected) {
            let exsits = !1;
            $scope.selectedItems.forEach((sitem) => {
              if (sitem[$scope.primary] === item[$scope.primary]) {
                exsits = !0;
              }
            });
            if (!exsits) {
              let nitem = { ...item };
              delete nitem.$selected;
              delete nitem.$$hashKey;
              $scope.selectedItems.push(nitem);
            }
          } else {
            $scope.selectedItems.forEach((sitem, index) => {
              if (sitem[$scope.primary] === item[$scope.primary]) {
                $scope.selectedItems.splice(index, 1);
              }
            });
          }

          $scope.ngModel = $scope.selectedItems;
          $timeout(() => {
            if ($scope.ngChange) {
              $scope.ngChange();
            }
          }, 100);
        };
      },
      template: `
       <div class="check-list">
            <label class="title margin"> {{label}} </label>
            <div class="row">
              <i-checkbox class="{{class2}}" label="{{item[display]}}" ng-repeat="item in items" ng-model="item.$selected" ng-change="change(item);"></i-checkbox>
            </div>
        </div>
        `,
    };
  },
]);

app.directive('iDate', function () {
  return {
    restrict: 'E',
    required: 'ngModel',
    scope: {
      label: '@',
      year: '@',
      ngModel: '=',
      ngChange: '&',
    },
    link: function ($scope, element, attrs) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }
      $scope.year = $scope.year ? parseInt($scope.year) : 1960;

      $scope.model = {};

      $scope.days = [];
      for (let i = 1; i < 32; i++) {
        $scope.days.push({
          id: i,
          name: i,
        });
      }
      $scope.years = [];
      for (let i = $scope.year; i < 2100; i++) {
        $scope.years.push({
          id: i,
          name: i,
        });
      }
      $scope.lang = site.session ? site.session.lang : 'en';
      if ($scope.lang === 'ar') {
        $scope.monthes = [
          { id: 0, name: 'يناير' },
          { id: 1, name: 'فبراير' },
          { id: 2, name: 'مارس' },
          { id: 3, name: 'ابريل' },
          { id: 4, name: 'مايو' },
          { id: 5, name: 'يونيو' },
          { id: 6, name: 'يوليو' },
          { id: 7, name: 'اغسطس' },
          { id: 8, name: 'سبتمبر' },
          { id: 9, name: 'اكتوبر' },
          { id: 10, name: 'نوفمبر' },
          { id: 11, name: 'ديسمبر' },
        ];
      } else {
        $scope.monthes = [
          { id: 0, name: 'Jan' },
          { id: 1, name: 'Feb' },
          { id: 2, name: 'Mar' },
          { id: 3, name: 'Aper' },
          { id: 4, name: 'May' },
          { id: 5, name: 'June' },
          { id: 6, name: 'Jule' },
          { id: 7, name: 'Aug' },
          { id: 8, name: 'Sep' },
          { id: 9, name: 'Oct' },
          { id: 10, name: 'Nov' },
          { id: 11, name: 'Des' },
        ];
      }

      $scope.$watch('ngModel', function (ngModel) {
        if (ngModel) {
          ngModel = new Date(ngModel);
          $scope.model = $scope.model || {};
          $scope.model.selectedDay = $scope.days.find((d) => d.id == ngModel.getDate());
          $scope.model.selectedMonth = $scope.monthes.find((m) => m.id == ngModel.getMonth());
          $scope.model.selectedYear = $scope.years.find((y) => y.id == ngModel.getFullYear());
        } else {
          $scope.model = $scope.model || {};
          $scope.model.selectedDay = null;
          $scope.model.selectedMonth = null;
          $scope.model.selectedYear = null;
        }
      });

      $scope.setDay = function () {
        $scope.ngModel = new Date();
      };
      $scope.updateDate = function (date) {
        if ($scope.model.selectedDay && $scope.model.selectedMonth && $scope.model.selectedYear) {
          $scope.ngModel = new Date($scope.model.selectedYear.id, $scope.model.selectedMonth.id, $scope.model.selectedDay.id, 0, 0, 0);
          if ($scope.ngChange) {
            $scope.ngChange();
          }
        }
      };
    },
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      disabled: '@',
      label: '@',
      ngModel: '=',
    },
    template: `/*##client-side/directive/i-date.html*/`,
  };
});

app.directive('iTime', function () {
  return {
    link: function ($scope, element, attrs) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      $scope.model = {};

      $scope.hours = [];
      for (let i = 1; i < 25; i++) {
        $scope.hours.push(i);
      }

      $scope.minutes = [];
      for (let i = 0; i < 60; i++) {
        $scope.minutes.push(i);
      }

      $(element)
        .find('select')
        .focus(() => {
          $('.popup').hide();
        });

      $scope.$watch('ngModel', function (ngModel) {
        if (ngModel) {
          ngModel.date = new Date(ngModel.date);
          $scope.model = $scope.model || {};
          $scope.model.hour = ngModel.hour;
          $scope.model.minute = ngModel.minute;
        } else {
          $scope.model = $scope.model || {};
          $scope.model.hour = 0;
          $scope.model.minute = 0;
        }
      });

      $scope.updateTime = function () {
        if ($scope.model) {
          $scope.ngModel = $scope.ngModel || {};
          $scope.ngModel.hour = $scope.model.hour;
          $scope.ngModel.minute = $scope.model.minute;
          $scope.ngModel.date = new Date(null, null, null, $scope.model.hour, $scope.model.minute, null);
        } else {
          delete $scope.ngModel;
        }
      };
    },
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      disabled: '@',
      label: '@',
      ngModel: '=',
    },
    template: `
      <div class="row i-time">
        <div class=" control ">
          <label class="text-center"> {{label}}  </label>
        <div class="row">
            <div class="col6 right">
            <div class="row">
            <div class="col2"></div>
            <div class="col8">
            <select ng-disabled="disabled" ng-model="model.minute" ng-change="updateTime()" class="small appearance-none no-border-left no-border-radius" >
                    <option ng-repeat="m in minutes" ng-value="m"> {{m}}</option>
                </select>
            </div>
            <div class="col2"></div>
            </div>
                
            </div>
            <div class="col6">
            <div class="row">
            <div class="col2 space right">
            <span> : </span>
            </div>
            <div class="col8">
                <select ng-disabled="disabled" ng-model="model.hour" ng-change="updateTime()" class="large blue appearance-none no-border-left no-border-radius" >
                    <option ng-repeat="h in hours" ng-value="h"> {{h}} </option>
                </select>
            </div>
           
            </div>
           
            </div>
        </div>
      </div>
      `,
  };
});

app.directive('iDatetime2', function () {
  return {
    link: function ($scope, element, attrs) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      $scope.hour1 = [];
      for (let i = 1; i < 25; i++) {
        $scope.hour1.push(i);
      }

      $scope.minute_list = [];
      for (let i = 1; i < 60; i++) {
        $scope.minute_list.push({
          name: i,
        });
      }

      $scope.days1 = [];
      for (let i = 1; i < 32; i++) {
        $scope.days1.push(i);
      }
      $scope.years1 = [];
      for (let i = 1900; i < 2100; i++) {
        $scope.years1.push(i);
      }
      $scope.monthes1 = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];

      $scope.model = null;

      $(element)
        .find('select')
        .focus(() => {
          $('.popup').hide();
        });

      $scope.$watch('ngModel', function (ngModel) {
        if (ngModel) {
          ngModel = new Date(ngModel);
          $scope.model = $scope.model || {};
          $scope.model.hour = ngModel.getHours();
          $scope.model.minute = ngModel.getMinutes();
          $scope.model.day = ngModel.getDate();
          $scope.model.month = ngModel.getMonth();
          $scope.model.year = ngModel.getFullYear();
        } else {
          $scope.model = $scope.model || {};
          $scope.model.hour = 0;
          $scope.model.minute = 0;
          $scope.model.day = 0;
          $scope.model.month = -1;
          $scope.model.year = 0;
        }
      });

      $scope.updateDate = function () {
        if ($scope.model && $scope.model.year && $scope.model.day) {
          $scope.ngModel = new Date($scope.model.year, $scope.model.month, $scope.model.day, $scope.model.hour, $scope.model.minute);
        } else {
          delete $scope.ngModel;
        }
      };
    },
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      disabled: '@',
      label: '@',
      ngModel: '=',
    },
    template: `
      <div class="row i-datetime2">
  
        <div class=" control">
          <label> {{label}}  </label>
          <div class="row">

            <div class="col2 day"> 
              <select v="{{v}}" ng-disabled="disabled" ng-model="model.day" ng-change="updateDate()" class="appearance-none no-border-left no-border-radius" >
              <option ng-repeat="d1 in days1" ng-value="d1"> {{d1}} </option>
              </select>
            </div>
            <div class="col5 month"> 
              <select v="{{v}}" ng-disabled="disabled" ng-model="model.month" ng-change="updateDate()" class="appearance-none no-border-left no-border-right no-border-radius" >
              <option ng-repeat="m1 in monthes1" ng-value="$index"> {{m1}} </option>
              </select>
            </div>
            <div class="col3 year"> 
              <select v="{{v}}" ng-disabled="disabled" ng-model="model.year" ng-change="updateDate()" class="appearance-none no-border-right no-border-radius" >
              <option ng-repeat="y1 in years1" ng-value="y1"> {{y1}} </option>
              </select>
            </div>

            <div class="col1 hour"> 
                <select v="{{v}}" ng-disabled="disabled" ng-model="model.hour" ng-change="updateDate()" class="appearance-none  no-border-radius" >
                <option ng-repeat="h1 in hour1" ng-value="h1"> {{h1}} </option>
             </select>
            </div>
            <div class="col1 minute"> 
                <select v="{{v}}" ng-disabled="disabled" ng-model="model.minute" ng-change="updateDate()" class="green appearance-none no-border-right no-border-radius" >
                <option ng-repeat="m1 in minute_list" ng-value="m1.name" class="green"> {{m1.name}} </option>
              </select>
            </div>

          </div>
        </div>
    
  
      </div>
      `,
  };
});

app.directive('iMonth2', function () {
  return {
    link: function ($scope, element, attrs) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      $scope.years = [];
      for (let i = 1900; i < 2100; i++) {
        $scope.years.push(i);
      }
      $scope.monthes = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];

      $scope.model = null;

      $(element)
        .find('select')
        .focus(() => {
          $('.popup').hide();
        });

      $scope.$watch('ngModel', function (ngModel) {
        if (ngModel) {
          ngModel = new Date(ngModel);
          $scope.model = $scope.model || {};
          $scope.model.day = 1;
          $scope.model.month = ngModel.getMonth();
          $scope.model.year = ngModel.getFullYear();
        } else {
          $scope.model = $scope.model || {};
          $scope.model.day = 0;
          $scope.model.month = -1;
          $scope.model.year = 0;
        }
      });

      $scope.updateDate = function () {
        if ($scope.model && $scope.model.year) {
          $scope.ngModel = new Date($scope.model.year, $scope.model.month, 1);
        } else {
          delete $scope.ngModel;
        }
      };
    },
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      label: '@',
      disabled: '@',
      ngModel: '=',
    },
    template: `
      <div class="row i-date2">
  
        <div class=" control">
          <label> {{label}} </label>
          <div class="row">
           
            <div class="col7 month"> 
              <select ng-disabled="disabled" v="{{v}}" ng-model="model.month" ng-change="updateDate()" class="appearance-none no-border-left  no-border-radius" >
              <option ng-repeat="m1 in monthes" ng-value="$index"> {{m1}} </option>
              </select>
            </div>

            <div class="col5 year"> 
              <select ng-disabled="disabled" v="{{v}}" ng-model="model.year" ng-change="updateDate()" class="appearance-none no-border-right no-border-radius" >
              <option ng-repeat="y1 in years" ng-value="y1"> {{y1}} </option>
              </select>
            </div>

          </div>
        </div>
    
  
      </div>
      `,
  };
});

app.directive('iFulldate', [
  '$http',
  function ($http) {
    return {
      link: function ($scope, element, attrs, ngModel) {
        let _busy = !1;

        if (typeof attrs.disabled !== 'undefined') {
          attrs.disabled = 'disabled';
        } else {
          attrs.disabled = '';
        }

        $(element)
          .find('select')
          .focus(() => {
            $('.popup').hide();
          });

        $scope.days1 = [];
        for (let i = 1; i < 32; i++) {
          $scope.days1.push(i);
        }
        $scope.years1 = [];
        for (let i = 1950; i < 2030; i++) {
          $scope.years1.push(i);
        }

        $scope.monthes1 = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];

        $scope.days2 = [];
        for (let i = 1; i < 31; i++) {
          $scope.days2.push(i);
        }
        $scope.years2 = [];
        for (let i = 1370; i < 1450; i++) {
          $scope.years2.push(i);
        }
        $scope.monthes2 = ['محرم', 'صفر', 'ربيع اول', 'ربيع ثان', 'جمادى اول', 'جمادى ثان', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذى القعدة', 'ذى الحجة'];

        $scope.model = {};

        $scope.$watch('ngModel', function (ngModel) {
          if (ngModel) {
            $scope.model = ngModel;
          } else {
            $scope.model = {};
          }
        });

        $scope.$watch('ngModel.date', function (date) {
          if (date) {
            if (typeof date == 'string') {
              date = new Date(date);
            }
            $scope.model = $scope.model || {};
            $scope.model.date = date;
            $scope.model.day = date.getDate();
            $scope.model.month = date.getMonth();
            $scope.model.year = date.getFullYear();
            $scope.get_hijri_date();
          }
        });

        $scope.get_hijri_date = function () {
          if ($scope.model && $scope.model.year && $scope.model.day) {
            ngModel.$setViewValue($scope.model);
            if (_busy) {
              return;
            }
            _busy = !0;
            $scope.model.date = new Date($scope.model.year, $scope.model.month, $scope.model.day);
            $http({
              method: 'POST',
              url: '/api/get_hijri_date',
              data: {
                date: $scope.model.year + '/' + ($scope.model.month + 1) + '/' + $scope.model.day,
              },
            })
              .then((response) => {
                if (response.data.done) {
                  $scope.model.hijri = response.data.hijri;
                  $scope.model.day2 = parseInt($scope.model.hijri.split('/')[2]);
                  $scope.model.month2 = parseInt($scope.model.hijri.split('/')[1]) - 1;
                  $scope.model.year2 = parseInt($scope.model.hijri.split('/')[0]);
                  ngModel.$setViewValue($scope.model);
                  _busy = !1;
                }
              })
              .catch(() => {
                _busy = !1;
              });
          }
        };

        $scope.get_normal_date = function () {
          if ($scope.model && $scope.model.year2 && $scope.model.day2) {
            ngModel.$setViewValue($scope.model);
            if (_busy) {
              return;
            }
            _busy = !0;
            $http({
              method: 'POST',
              url: '/api/get_normal_date',
              data: {
                hijri: $scope.model.year2 + '/' + ($scope.model.month2 + 1) + '/' + $scope.model.day2,
              },
            })
              .then((response) => {
                if (response.data.done) {
                  $scope.model.date = new Date(response.data.date);
                  $scope.model.day = parseInt(response.data.date.split('/')[2]);
                  $scope.model.month = parseInt(response.data.date.split('/')[1]) - 1;
                  $scope.model.year = parseInt(response.data.date.split('/')[0]);
                  ngModel.$setViewValue($scope.model);
                  _busy = !1;
                }
              })
              .catch(() => {
                _busy = !1;
              });
          }
        };
      },
      restrict: 'E',
      require: 'ngModel',
      scope: {
        v: '@',
        label1: '@',
        label2: '@',
        disabled: '@',
        ngModel: '=',
        ngChange: '&',
      },
      template: `
      <div class="row i-date">
  
        <div class="col6 control">
          <label> {{label1}} </label>
          <div class="row">
            <div class="col3 day"> 
              <select ng-change="get_hijri_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.day" class="appearance-none no-border-left no-border-radius">
              <option ng-repeat="d1 in days1" ng-value="d1"> {{d1}} </option>
              </select>
            </div>
            <div class="col5 month"> 
              <select ng-change="get_hijri_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.month" class="appearance-none no-border-left no-border-right no-border-radius">
              <option ng-repeat="m1 in monthes1" ng-value="$index"> {{m1}} </option>
              </select>
            </div>
            <div class="col4 year"> 
              <select ng-change="get_hijri_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.year" class="appearance-none no-border-right no-border-radius">
              <option ng-repeat="y1 in years1" ng-value="y1"> {{y1}} </option>
              </select>
            </div>
          </div>
        </div>
     
        <div class="col6 control">
          <label> {{label2}} </label>
          <div class="row">
            <div class="col3 day"> 
              <select ng-change="get_normal_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.day2" class="appearance-none no-border-left no-border-radius">
              <option ng-repeat="d2 in days2" ng-value="d2"> {{d2}} </option>
              </select>
            </div>
            <div class="col5 month"> 
              <select ng-change="get_normal_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.month2" class="appearance-none no-border-left no-border-right no-border-radius">
              <option ng-repeat="m2 in monthes2" ng-value="$index"> {{m2}} </option>
              </select>
            </div>
            <div class="col4 year"> 
              <select ng-change="get_normal_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.year2" class="appearance-none no-border-right no-border-radius">
              <option ng-repeat="y2 in years2" ng-value="y2"> {{y2}} </option>
              </select>
            </div>
          </div>
        </div>
  
      </div>
      `,
    };
  },
]);

app.directive('iChecklist2', [
  '$interval',
  function ($interval) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        label: '@',
        primary: '@',
        display: '@',
        ngModel: '=',
        items: '=',
        like: '&',
      },
      link: function ($scope, element, attrs, ctrl) {
        attrs.primary = attrs.primary || 'id';

        $scope.selectedItems = [];

        $scope.$watch('ngModel', (ngModel) => {
          $scope.reload();
        });

        $scope.reload = function () {
          $scope.selectedItems = [];

          if ($scope.ngModel) {
            $scope.ngModel.forEach((mitem) => {
              $scope.selectedItems.push(mitem);
            });

            if ($scope.items) {
              $scope.items.forEach((mitem) => {
                let exist = !1;
                $scope.selectedItems.forEach((sitem) => {
                  if (mitem[$scope.primary] === sitem[$scope.primary]) {
                    exist = !0;
                  }
                });
                if (exist) {
                  mitem.$selected = !0;
                } else {
                  mitem.$selected = !1;
                }
              });
            }
          }
          if (!$scope.ngModel) {
            $scope.selectedItems = [];
            if ($scope.items) {
              $scope.items.forEach((mitem) => {
                mitem.$selected = !1;
              });
            }
          }
        };

        $scope.change = function (item) {
          if (item.$selected) {
            let exsits = !1;
            $scope.selectedItems.forEach((sitem) => {
              if (sitem[$scope.primary] === item[$scope.primary]) {
                exsits = !0;
              }
            });
            if (!exsits) {
              $scope.selectedItems.push(item);
            }
          } else {
            $scope.selectedItems.forEach((sitem, index) => {
              if (sitem[$scope.primary] === item[$scope.primary]) {
                $scope.selectedItems.splice(index, 1);
              }
            });
          }

          $scope.ngModel = $scope.selectedItems;
        };
      },
      template: `
       <div class="row padding check-list">
            <label class="title"> {{label}} </label>
            <div class="control" ng-repeat="item in items">
                <label class="checkbox" >
                    <span > {{item[display]}} </span>
                    <input type="checkbox" ng-model="item.$selected" ng-change="change(item)" >
                    <span class="checkmark"></span>
                </label>
            </div>
        </div>
        `,
    };
  },
]);

app.directive('iRadiolist', [
  '$interval',
  function ($interval) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        label: '@',
        display: '@',
        ngModel: '=',
        items: '=',
      },
      link: function (scope, element, attrs) {
        scope.model = scope.ngModel;

        scope.code = 'radio_' + Math.random();

        scope.change = function (item) {
          scope.ngModel = item;
        };

        scope.isChecked = function (item) {
          if (item && scope.ngModel && scope.ngModel.id === item.id) {
            return !0;
          }
          return !1;
        };
      },
      template: `
       <div class="row padding radio-list">
            <label class="title"> {{label}} </label>
            <div class="control" ng-repeat="item in items">
                <label class="radio" >
                    <span > {{item[display]}} </span>
                    <input name="{{code}}" type="radio" ng-model="model"  ng-checked="isChecked(item)" ng-click="change(item)" ng-change="change(item)" >
                    <span class="checkmark"></span>
                </label>
            </div>
        </div>
        `,
    };
  },
]);

app.directive('iFile', [
  '$interval',
  'isite',
  function ($interval, isite) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        label: '@',
        folder: '@',
        ngModel: '=',
        ngClick: '&',
        onSelected: '&',
      },
      link: function ($scope, element, attrs, ctrl) {
        $scope.label = $scope.label || 'Select File to Upload';
        let input = $(element).find('input')[0];
        let button = $(element).find('button')[0];
        if (attrs.view === '') {
          $scope.viewOnly = !0;
        }
        let progress = $(element).find('.progress')[0];
        $(progress).hide();
        $scope.folder = $scope.folder || 'default';
        $scope.id = Math.random().toString().replace('.', '_');
        if (attrs.view !== '') {
          button.addEventListener('click', function () {
            input.click();
          });
        }

        input.addEventListener('change', function () {
          isite.uploadFile(
            this.files,
            {
              folder: $scope.folder,
            },
            (err, file, e) => {
              if (e) {
                $(progress).show();
                $scope.value = (e.loaded / e.total) * 100;
                $scope.max = e.total;
                if ($scope.value === 100) {
                  $(progress).hide();
                }
              }

              if (file) {
                $scope.ngModel = file;
                console.log(file);
              }
            }
          );
          $scope.ngModel = this.files[0].path;
          $scope.onSelected(this.files[0].path);
          $scope.$applyAsync();
        });

        $scope.$watch('ngModel', (ngModel) => {
          if (ngModel) {
            a.setAttribute('url', ngModel);
          }
        });
      },
      template: `/*##client-side/sub/i-file.content.html*/`,
    };
  },
]);

app.directive('iImage', [
  '$interval',
  'isite',
  function ($interval, isite) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        folder: '@',
        ngModel: '=',
        ngClick: '&',
      },
      link: function ($scope, element, attrs, ctrl) {
        $scope.folder = $scope.folder || 'default';

        let input = $(element).find('input')[0];
        let img = $(element).find('img')[0];
        let progress = $(element).find('.progress')[0];
        $(progress).hide();

        if (attrs.view !== '') {
          img.addEventListener('click', function () {
            input.click();
          });
        }

        input.addEventListener('change', function () {
          isite.uploadImage(
            this.files,
            {
              folder: $scope.folder,
            },
            (err, image, e) => {
              if (e) {
                $(progress).show();
                $scope.value = (e.loaded / e.total) * 100;
                $scope.max = e.total;
                if ($scope.value === 100) {
                  $(progress).hide();
                }
              }

              if (image) {
                $scope.ngModel = image;
              }
            }
          );
        });

        $scope.$watch('ngModel', (ngModel) => {
          if (ngModel) {
            img.setAttribute('src', ngModel.url);
          }
        });
      },
      template: `
        <div class=" text-center pointer">
            <input  class="hidden" type="file" name="fileToUpload" accept="image/*"/>
            <img class="rounded"  ng-src="{{ngModel.url}}" ngClick="ngClick()" onerror="this.src='/images/no.jpg'" />
            <div class="progress row">
               <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="100" style="width: {{value}}%"></div>
            </div>
        </div>
        `,
    };
  },
]);

app.directive('iUpload', [
  '$interval',
  'isite',
  function ($interval, isite) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        label: '@',
        api: '@',
        type: '@',
        ngModel: '=',
        ngClick: '&',
        onUploaded: '&',
      },
      link: function (scope, element, attrs, ctrl) {
        scope.type = scope.type || 'bg-green';

        let input = $(element).find('input')[0];
        let a = $(element).find('a')[0];
        let progress = $(element).find('progress')[0];
        $(progress).hide();

        if (attrs.view !== '') {
          a.addEventListener('click', function () {
            input.click();
          });
        }

        input.addEventListener('change', function () {
          isite.upload(
            this.files,
            {
              api: scope.api,
            },
            (err, file, e) => {
              if (e) {
                $(progress).show();
                progress.value = e.loaded;
                progress.max = e.total;
              }

              if (file) {
                scope.ngModel = file;
                scope.onUploaded();
              }
            }
          );
        });

        scope.$watch('ngModel', (ngModel) => {
          if (ngModel) {
            a.setAttribute('url', ngModel);
          }
        });
      },
      template: `
        <form class="form text-center pointer">
            <input  class="hidden" type="file" name="file" />
            <a class="btn {{type}}" ngClick="ngClick()" url="{{ngModel}}"> {{label}} </a>
            <progress class="row"></progress>
        </form>
        `,
    };
  },
]);

app.directive('iFiles', [
  '$interval',
  'isite',
  function ($interval, isite) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        category: '@',
        label: '@',
        ngModel: '=',
      },
      link: function (scope, element, attrs, ctrl) {
        if (attrs.view === '') {
          scope.viewOnly = !0;
        }

        let progress = $(element).find('progress')[0];

        scope.category = scope.category || 'default';
        scope.id = Math.random().toString().replace('.', '_');
        scope.deleteFile = function (file) {
          isite.deleteFile(file, () => {
            for (let i = 0; i < scope.ngModel.length; i++) {
              let f = scope.ngModel[i];
              if (f.url === file.url) {
                scope.ngModel.splice(i, 1);
                return;
              }
            }
          });
        };

        let setEvent = !1;
        $interval(() => {
          if (setEvent) {
            return;
          }

          if (attrs.view !== '') {
            let btn = document.querySelector('#btn_' + scope.id);
            if (btn) {
              setEvent = !0;
              btn.addEventListener('click', function () {
                document.querySelector('#input_' + scope.id).click();
              });
            }

            let input = document.querySelector('#input_' + scope.id);
            if (input) {
              input.addEventListener('change', function () {
                isite.uploadFile(
                  this.files,
                  {
                    category: scope.category,
                  },
                  (err, file, e) => {
                    if (e) {
                      $(progress).show();
                      progress.value = e.loaded;
                      progress.max = e.total;
                    }

                    if (file) {
                      if (typeof scope.ngModel === 'undefined') {
                        scope.ngModel = [];
                      }
                      scope.ngModel.push(file);
                    }
                  }
                );
              });
            }
          } else {
            setEvent = !0;
          }
        }, 500);
      },
      template: `
            <div class="files">
                <label> {{label}} </label>
                <form ng-if="viewOnly !== !0" id="img_{{id}}" class="form text-center pointer">
                    <input id="input_{{id}}" class="hidden" type="file" name="file" />
                    <a id="btn_{{id}}" class="btn bg-green"> <i class="fa fa-upload white"></i> </a>
                </form>
                <progress class="row"></progress>
                <div class="padding">
                    
                    <div class="row padding" ng-repeat="f in ngModel">
                         <h2> 
                            <a class="btn default bg-blue" href="{{f.url}}"> <i class="fa fa-2x fa-download white"></i> </a>
                            <a ng-if="viewOnly !== !0" class="btn default bg-red" ng-click="deleteFile(f)"> <i class="fa fa-trash white"></i> </a>
                            <span>  {{f.name}} </span>
                         </h2>  
                    </div>
                </div>
            </div>
            
        `,
    };
  },
]);

app.directive('iDrag', [
  '$document',
  function ($document) {
    return function (scope, element, attr) {
      var startX = 0,
        startY = 0,
        x = 0,
        y = 0;

      element.css({
        position: 'relative',
      });

      element.on('mousedown', function (event) {
        event.preventDefault();
        startX = event.screenX - x;
        startY = event.screenY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.screenY - startY;
        x = event.screenX - startX;
        element.css({
          top: y + 'px',
          left: x + 'px',
        });
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    };
  },
]);

app.directive('iTreeview', [
  '$interval',
  '$timeout',
  'isite',
  function ($interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        v: '@',
        label: '@',
        display: '@',
        display2: '@',
        disabled: '@',
        space: '@',
        primary: '@',
        ngValue: '@',
        ngModel: '=',
        ngSearch: '=',
        ngChange: '&',
        ngClick: '&',
        ngAdd: '&',
        ngNode: '&',
        ngEdit: '&',
        ngDelete: '&',
        nodes: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        attrs.display = attrs.display || 'name';
        attrs.primary = attrs.primary || 'id';
        attrs.space = attrs.space || ' ';
        attrs.ngValue = attrs.ngValue || '';

        $scope.source = {};

        $scope.setNodes = function (v_node) {
          v_node.nodes.forEach((v_node2) => {
            v_node2.nodes = v_node2.nodes || [];
            $scope.nodes.forEach((node) => {
              if (node.$parent_id == v_node2.id) {
                node.v_display = node.v_display || '';
                node.v_display += node[attrs.display];

                let exist = !1;
                v_node2.nodes.forEach((n) => {
                  if (n.id == node.id) {
                    exist = !0;
                  }
                });
                if (!exist) {
                  v_node2.nodes.push(node);
                }
              }
            });
            $scope.setNodes(v_node2);
          });
        };

        $scope.v_nodes = [];

        $scope.$watch('ngModel', (ngModel) => {
          if (ngModel) {
            $scope.ngModel = ngModel;
            $scope.ngModel.v_display = $scope.ngModel.v_display || ngModel[attrs.display];
          }
        });

        $scope.$watch('nodes', (nodes) => {
          $scope.v_nodes = [];
          if (nodes) {
            nodes.forEach((node) => {
              node.$parent_id = node.parent_id || 0;
              node.v_display = node.v_display || '';
              node.v_display += node[attrs.display];
              if (node.$parent_id == 0) {
                let exist = !1;
                $scope.v_nodes.forEach((n) => {
                  if (n.id == node.id) {
                    exist = !0;
                  }
                });
                if (!exist) {
                  $scope.v_nodes.push(node);
                }
              }
            });

            $scope.v_nodes.forEach((v_node) => {
              v_node.nodes = v_node.nodes || [];

              nodes.forEach((node) => {
                node.$parent_id = node.parent_id || 0;
                if (node.$parent_id == v_node.id) {
                  node.v_display = node.v_display || '';
                  node.v_display += node[attrs.display];

                  let exist = !1;
                  v_node.nodes.forEach((n) => {
                    if (n.id == node.id) {
                      exist = !0;
                    }
                  });
                  if (!exist) {
                    v_node.nodes.push(node);
                  }
                }
              });

              $scope.setNodes(v_node);
            });
          }
        });
      },
      template: `
        <div class="treeview">
        <ul >
            <li ng-dblclick="$event.preventDefault();$event.stopPropagation();source.$actions = !0" ng-mouseleave="source.$actions = !1">
           
            <i ng-hide="openTree" class="fa fa-folder"></i>  <i ng-show="openTree" class="fa fa-folder"></i> 
           

            <span ng-click="openTree = !openTree" class="title"> {{label}} <small class="display"> [ {{ngModel.v_display}} ] </small>  </span>
                <div class="actions" ng-show="source.$actions === !0">
                    <i-button type="add default" ng-click="ngClick($event , ngModel);ngNode($event , ngModel)"></i-button>
                </div>
                <i-treenode display="{{display}}" ng-click="ngClick($event)" ng-add="ngAdd()" ng-edit="ngEdit()" ng-delete="ngDelete()" ng-show="openTree" ng-model="ngModel" nodes="v_nodes" ></i-treenode>
            </li>
        </ul>
        </div>
        `,
    };
  },
]);

app.directive('iTreenode', [
  '$interval',
  '$timeout',
  'isite',
  function ($interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        v: '@',
        label: '@',
        display: '@',
        display2: '@',
        disabled: '@',
        space: '@',
        primary: '@',
        ngValue: '@',
        ngChange: '&',
        ngClick: '&',
        ngAdd: '&',
        ngEdit: '&',
        ngDelete: '&',
        ngModel: '=',
        ngSearch: '=',
        nodes: '=',
        nodes: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        attrs.display = attrs.display || 'name';
        attrs.primary = attrs.primary || 'id';
        attrs.space = attrs.space || ' ';
        attrs.ngValue = attrs.ngValue || '';
        $scope.nodes = $scope.nodes || [];

        $scope.v_nodes = [];

        $scope.$watch('nodes', (nodes) => {
          $scope.v_nodes = [];
          if (nodes) {
            nodes.forEach((node, i) => {
              if (node.nodes) {
                node.nodes.forEach((node2, i) => {
                  node2.$parent_id = node2.parent_id || node.id;
                  node2.v_display = node.v_display || ' ';
                  node2.v_display += ' - ' + node2[attrs.display];
                });
              }
            });
          }
        });

        $scope.updateParentModal = function (parent, node) {
          if (parent) {
            parent.ngModel = node;
            if (parent.$parent) {
              $scope.updateParentModal(parent.$parent, node);
            }
          }
        };

        $scope.unSelectParent = function (parent) {
          if (parent && parent.nodes) {
            parent.nodes.forEach((node) => {
              node.$selected = !1;
            });
            if (parent.$parent) {
              $scope.unSelectParent(parent.$parent);
            }
          }
        };

        $scope.unSelectNodes = function (nodes) {
          if (nodes) {
            nodes.forEach((node) => {
              node.$selected = !1;
              if (node.nodes) {
                $scope.unSelectNodes(node.nodes);
              }
            });
          }
        };

        $scope.updateModal = function (node) {
          $scope.ngModel = node;
          $scope.updateParentModal($scope.$parent, node);
        };

        $scope.selected = function (node) {
          $scope.unSelectParent($scope.$parent);
          $scope.unSelectNodes($scope.nodes);

          if (node.nodes) {
            node.nodes.forEach((itm) => {
              itm.$selected = !1;
            });
          }

          node.$selected = !0;
        };
      },
      template: `
        <div class="treenode"> 
        <ul >
            <li  ng-repeat="node in nodes" >
            <div class="row" ng-dblclick="$event.preventDefault();$event.stopPropagation();node.$actions = !0;source.$actions = !1" ng-mouseleave="node.$actions = !1">
            <span ng-show="node.nodes.length > 0" ng-click="node.$expand = !node.$expand;">
                    <i ng-hide="node.$expand" class="fa fa-caret-left"></i>  <i ng-show="node.$expand" class="fa fa-caret-down"></i> 
            </span>
            <span ng-hide="node.nodes.length > 0" >
                    <i class="fa fa-file"></i>
            </span>

                <span class="text" ng-class="{'selected' : node.$selected == !0}" ng-click="ngClick($event , node);node.$expand = !node.$expand;selected(node);updateModal(node)"   > {{node[display]}} </span>
                <div class="actions" ng-show="node.$actions === !0">
                    <i-button type="add default" ng-click="ngAdd(node)"></i-button>
                    <i-button type="edit default" ng-click="ngEdit(node)"></i-button>
                    <i-button type="delete default" ng-click="ngDelete(node)"></i-button>
                </div>
            </div>   
                <i-treenode display="{{display}}" ng-click="ngClick($event)" ng-add="ngAdd()" ng-edit="ngEdit()" ng-delete="ngDelete()" ng-show="node.$expand" ng-model="ngModel" nodes="node.nodes" nodes="node.nodes"></i-treenode>
            </li>
        </ul>
        </div>
        `,
    };
  },
]);
