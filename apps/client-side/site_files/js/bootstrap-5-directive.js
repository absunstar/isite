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
    template: `/*##client-side/directive/i-control.html*/`,
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
      $scope.rows = $scope.rows || 10;
      $scope.id2 = $scope.id2 || 'input_' + Math.random().toString().replace('0.', '');
      $(element)
        .find('textarea')
        .focus(() => {
          $('.popup').hide();
        });
    },
    template: `/*##client-side/directive/i-textarea.html*/`,
  };
});
app.directive('iContent', function ($timeout, $interval) {
  return {
    restrict: 'E',
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
      $scope.rows = $scope.rows || 10;
      $scope.id2 = $scope.id2 || 'textarea_' + Math.random().toString().replace('0.', '');
      $(element)
        .find('textarea')
        .focus(() => {
          $('.popup').hide();
        });
      $timeout(() => {
        window['content_' + attrs.id] = WebShareEditor.create($scope.id2, {
          toolbarItem: [
            ['undo', 'redo'],
            ['font', 'fontSize', 'formatBlock'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['removeFormat'],
            ['fontColor', 'hiliteColor'],
            ['outdent', 'indent'],
            ['align', 'horizontalRule', 'list', 'table'],
            ['link', 'image', 'video'],
            ['preview', 'print'],
            /* ['fullScreen', 'showBlocks', 'codeView'],
            ['save', 'template'],*/
          ],
          width: '100%',
          minHeight: '300px',
        });
        if ($scope.ngModel) {
          window['content_' + attrs.id].setContents($scope.ngModel);
        }
        $interval(() => {
          $scope.ngModel2 = window['content_' + attrs.id].getContents();
          if ($scope.ngModel !== $scope.ngModel2) {
            $scope.ngModel = $scope.ngModel2;
            $scope.changed();
          }
        }, 1000);
      }, 500);

      $scope.changed = function () {
        $timeout(() => {
          if ($scope.ngChange) {
            $scope.ngChange();
          }
        }, 100);
      };

      $scope.$watch('ngModel', (ngModel) => {
        if (ngModel && window['content_' + attrs.id]) {
          if ($scope.ngModel !== $scope.ngModel2) {
            $scope.ngModel = $scope.ngModel2;
            window['content_' + attrs.id].setContents($scope.ngModel);
          }
        }
      });
    },
    template: `/*##client-side/directive/i-content.html*/`,
  };
});

app.directive('iCheckbox', function ($timeout) {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      label: '@',
      id2: '@',
      ngDisabled: '@',
      ngModel: '=',
      ngChange: '&',
    },
    link: function ($scope, element, attrs, ctrl) {
      $scope.id2 = $scope.id2 || 'input_' + Math.random().toString().replace('0.', '');
      $scope.changed = function () {
        $timeout(() => {
          if ($scope.ngChange) {
            $scope.ngChange();
          }
        }, 100);
      };
    },
    template: `/*##client-side/directive/i-checkbox.html*/`,
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
      ngValue: '@',
      ngModel: '=',
      ngChange: '&',
    },
    link: function ($scope, element, attrs, ctrl) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      $scope.group = $scope.group || attrs.ngModel.replaceAll('.', '_');
      $scope.id2 = $scope.id2 || 'input_' + Math.random().toString().replace('0.', '');
    },
    template: `/*##client-side/directive/i-radio.html*/`,
  };
});

app.directive('iButton', function () {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      type: '@',
      class2: '@',
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
      } else if ($scope.type.like('*list*')) {
        $scope.fa = 'fas fa-list';
        $scope.class = 'btn-info';
      } else if ($scope.type.like('unapprove')) {
        $scope.fa = 'fas fa-eject';
        $scope.class = 'btn-danger';
      } else if ($scope.type.like('approve')) {
        $scope.fa = 'fas fa-check-double';
        $scope.class = 'btn-primary';
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
      } else if ($scope.type.like('*export*') || $scope.type.like('*excel*')) {
        $scope.fa = 'fas fa-file-export';
        $scope.class = 'btn-secondary';
      } else if ($scope.type.like('*search*') || $scope.type.like('*find*')) {
        $scope.fa = 'fas fa-search';
        $scope.class = 'btn-light';
      } else if ($scope.type.like('*login*') || $scope.type.like('*signin*')) {
        $scope.fa = 'fas fa-sign-in-alt';
        $scope.class = 'btn-light';
      } else if ($scope.type.like('*logout*') || $scope.type.like('*signout*')) {
        $scope.fa = 'fas fa-sign-out-alt';
        $scope.class = 'btn-light';
      }
      if ($scope.type.like('*default*')) {
        $scope.class = '';
      }
      if ($scope.class2) {
        $scope.class = $scope.class2;
      }
      $scope.$watch('loading', (loading) => {
        if (loading === 'true') {
          $scope.busy = true;
        } else {
          $scope.busy = false;
        }
      });
    },
    template: `/*##client-side/directive/i-button.html*/`,
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
        ngGet: '&',
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

        if ($scope.ngSearch) {
          $scope.showSearch = !0;
        }
        if ($scope.ngGet) {
          $scope.showSearch = !0;
        }

        let input = $(element).find('input.dropdown-text');
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

        $scope.searchElement.on('input', () => {
          $timeout(() => {
            if (attrs.ngGet) {
              $scope.ngGet({ $search: $scope.searchElement.val() });
            } else if (attrs.ngSearch) {
              $scope.$filter = $scope.searchElement.val();
            }
          }, 100);
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
      template: `/*##client-side/directive/i-list.html*/`,
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
        $scope.class2 = $scope.class2 || 'col3';
        $scope.selectedItems = [];

        $scope.$watch('ngModel', (ngModel) => {
          $scope.reload();
        });
        $scope.$watch('items', (ngModel) => {
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
      template: `/*##client-side/directive/i-checklist.html*/`,
    };
  },
]);

app.directive('iDate', function () {
  return {
    restrict: 'E',
    required: 'ngModel',
    scope: {
      label: '@',
      V: '@',
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
      $scope.dayTitle = 'Day';
      $scope.monthTitle = 'Month';
      $scope.yearTitle = 'Year';

      $scope.lang = site.session ? site.session.lang : 'en';
      if ($scope.lang === 'ar') {
        $scope.dayTitle = 'يوم';
        $scope.monthTitle = 'شهر';
        $scope.yearTitle = 'سنة';
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
          { id: 3, name: 'Apr' },
          { id: 4, name: 'May' },
          { id: 5, name: 'Jun' },
          { id: 6, name: 'Jul' },
          { id: 7, name: 'Aug' },
          { id: 8, name: 'Sep' },
          { id: 9, name: 'Oct' },
          { id: 10, name: 'Nov' },
          { id: 11, name: 'Dec' },
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
          $scope.editOnly = false;
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

app.directive('iDatetime', function () {
  return {
    restrict: 'E',
    required: 'ngModel',
    scope: {
      label: '@',
      V: '@',
      ngYear: '@',
      ngModel: '=',
      ngChange: '&',
    },
    link: function ($scope, element, attrs) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }
      $scope.year = $scope.ngYear ? parseInt($scope.ngYear) : 1960;

      $scope.model = {};

      $scope.hours = [];
      for (let i = 0; i < 24; i++) {
        $scope.hours.push({
          id: i,
          name: i < 10 ? '0' + i : i,
        });
      }
      $scope.minutes = [];
      for (let i = 0; i < 60; i++) {
        $scope.minutes.push({
          id: i,
          name: i < 10 ? '0' + i : i,
        });
      }

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
      $scope.dayTitle = 'Day';
      $scope.monthTitle = 'Month';
      $scope.yearTitle = 'Year';
      $scope.hourTitle = 'Hour';
      $scope.minuteTitle = 'Minute';

      $scope.lang = site.session ? site.session.lang : 'en';
      if ($scope.lang === 'ar') {
        $scope.dayTitle = 'يوم';
        $scope.monthTitle = 'شهر';
        $scope.yearTitle = 'سنة';
        $scope.hourTitle = 'ساعة';
        $scope.minuteTitle = 'دقيقة';
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
          { id: 3, name: 'Apr' },
          { id: 4, name: 'May' },
          { id: 5, name: 'Jun' },
          { id: 6, name: 'Jul' },
          { id: 7, name: 'Aug' },
          { id: 8, name: 'Sep' },
          { id: 9, name: 'Oct' },
          { id: 10, name: 'Nov' },
          { id: 11, name: 'Dec' },
        ];
      }

      $scope.$watch('ngModel', function (ngModel) {
        if (ngModel) {
          ngModel = new Date(ngModel);
          $scope.model = $scope.model || {};
          $scope.model.selectedDay = $scope.days.find((d) => d.id == ngModel.getDate());
          $scope.model.selectedMonth = $scope.monthes.find((m) => m.id == ngModel.getMonth());
          $scope.model.selectedYear = $scope.years.find((y) => y.id == ngModel.getFullYear());
          $scope.model.selectedHour = $scope.hours.find((y) => y.id == ngModel.getHours());
          $scope.model.selectedMinute = $scope.minutes.find((y) => y.id == ngModel.getMinutes());
          $(element).attr('value', ngModel.getTime());
        } else {
          $scope.model = $scope.model || {};
          $scope.model.selectedDay = null;
          $scope.model.selectedMonth = null;
          $scope.model.selectedYear = null;
          $scope.model.selectedHour = null;
          $scope.model.selectedMinute = null;
          $(element).attr('value', '');
        }
      });

      $scope.setDay = function () {
        $scope.ngModel = new Date();
      };

      $scope.updateDate = function (date) {
        if ($scope.model.selectedDay && $scope.model.selectedMonth && $scope.model.selectedYear && $scope.model.selectedHour && $scope.model.selectedMinute) {
          $scope.ngModel = new Date($scope.model.selectedYear.id, $scope.model.selectedMonth.id, $scope.model.selectedDay.id, $scope.model.selectedHour.id, $scope.model.selectedMinute.id, 0);
          $scope.editOnly = false;
          $(element).attr('value', $scope.ngModel.getTime());
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
    template: `/*##client-side/directive/i-datetime.html*/`,
  };
});

app.directive('iFile', [
  '$interval',
  'isite',
  '$timeout',
  function ($interval, isite, $timeout) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        label: '@',
        view: '@',
        accept: '@',
        folder: '@',
        ngModel: '=',
        ngClick: '&',
        onSelected: '&',
        ngChange: '&',
      },
      link: function ($scope, element, attrs, ctrl) {
        $scope.label = $scope.label || '';
        $scope.folder = $scope.folder || 'default';
        $scope.accept = $scope.accept ? $scope.accept : '';
        $scope.viewOnly = $scope.view === undefined ? false : true;

        let input = $(element).find('input')[0];
        let button = $(element).find('button')[0];

        let progress = $(element).find('.progress')[0];
        $(progress).hide();

        $scope.id = Math.random().toString().replace('.', '_');

        if (!$scope.viewOnly) {
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
                $scope.changed();
              }
            }
          );
          $scope.ngModel = this.files[0].path;
          $scope.onSelected(this.files[0].path);
          $scope.$applyAsync();
        });

        $scope.$watch('ngModel', (ngModel) => {
          if (ngModel) {
            button.setAttribute('url', ngModel);
          }
        });

        $scope.changed = function () {
          $timeout(() => {
            if ($scope.ngChange) {
              $scope.ngChange();
            }
          }, 200);
        };
      },
      template: `/*##client-side/directive/i-file.html*/`,
    };
  },
]);

app.directive('iImage', [
  '$interval',
  'isite',
  '$timeout',
  function ($interval, isite, $timeout) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        folder: '@',
        view: '@',
        accept: '@',
        ngModel: '=',
        ngClick: '&',
        ngChange: '&',
      },
      link: function ($scope, element, attrs, ctrl) {
        $scope.folder = $scope.folder || 'default';
        $scope.accept = $scope.accept ? $scope.accept : 'image/*';
        $scope.viewOnly = $scope.view === undefined ? false : true;

        let input = $(element).find('input')[0];
        let img = $(element).find('img')[0];
        let progress = $(element).find('.progress')[0];
        $(progress).hide();

        if (!$scope.viewOnly) {
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
                if ($scope.ngChange) {
                  $timeout(() => {
                    $scope.ngChange();
                  }, 200);
                }
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
      template: `/*##client-side/directive/i-image.html*/`,
    };
  },
]);
app.directive('iUpload', [
  '$interval',
  'isite',
  function ($interval, isite) {
    return {
      restrict: 'E',
      scope: {
        label: '@',
        api: '@',
        type: '@',
        view: '@',
        ngClick: '&',
        onUploaded: '&',
      },
      link: function ($scope, element, attrs, ctrl) {
        let input = $(element).find('input')[0];
        let a = $(element).find('button')[0];
        let progress = $(element).find('progress')[0];
        $(progress).hide();

        if (attrs.view !== '') {
          a.addEventListener('click', function () {
            input.click();
          });
        }

        input.addEventListener('change', function () {
          if ($scope.api) {
            isite.upload(
              this.files,
              {
                api: $scope.api,
              },
              (err, data, e) => {
                if (e) {
                  $(progress).show();
                  progress.value = e.loaded;
                  progress.max = e.total;
                }

                if (data) {
                  $scope.onUploaded(data);
                }
              }
            );
          }
        });
      },
      template: `/*##client-side/directive/i-upload.html*/`,
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
              node.$parent_id = node.parent_id || node.parentId || 0;
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
                node.$parent_id = node.parent_id || node.parentId || 0;
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
      template: `/*##client-side/directive/i-treeview.html*/`,
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
      template: `/*##client-side/directive/i-treenode.html*/`,
    };
  },
]);
