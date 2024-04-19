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
      $scope.v = $scope.v || '';
      $scope.requird = '';
      if ($scope.v.like('*r*')) {
        $scope.requird = '*';
      }
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
      $scope.stopReading = false;
      $scope.rows = $scope.rows || 10;
      $scope.id2 = $scope.id2 || 'textarea_' + Math.random().toString().replace('0.', '');
      $(element).find('textarea').id = $scope.id2;
      $(element)
        .find('textarea')
        .focus(() => {
          $('.popup').hide();
        });
      $scope.handelContentElement = function () {
        if (!document.querySelector('#' + $scope.id2)) {
          $timeout(() => {
            $scope.handelContentElement();
          }, 1000);
          return false;
        }
        window['content_' + $scope.id2] = WebShareEditor.create($scope.id2, {
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
        if ($scope.ngModel && window['content_' + $scope.id2]) {
          window['content_' + $scope.id2].setContents($scope.ngModel);
        }
        $scope.readingNow();
      };

      $scope.readingNow = function () {
        $scope.intravalReading = $interval(() => {
          if (window['content_' + $scope.id2]) {
            $scope.ngModel2 = window['content_' + $scope.id2].getContents();
            if ($scope.ngModel !== $scope.ngModel2) {
              $scope.ngModel = $scope.ngModel2;
              $scope.changed();
            }
          }
        }, 1000);
      };
      $scope.handelContentElement();

      $scope.changed = function () {
        $timeout(() => {
          if ($scope.ngChange) {
            $scope.ngChange();
          }
        }, 100);
      };

      $scope.$watch('ngModel', (ngModel) => {
        clearInterval($scope.intravalReading);

        if (ngModel && window['content_' + $scope.id2]) {
          if ($scope.ngModel2 && $scope.ngModel !== $scope.ngModel2) {
            $scope.ngModel = $scope.ngModel2;
            window['content_' + $scope.id2].setContents($scope.ngModel);
          }
        }
        $scope.readingNow();
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

app.directive('iButton', [
  '$interval',
  '$timeout',
  function ($interval, $timeout) {
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
        $scope.class = $scope.class = 'btn-light';
        $scope.fa = $scope.fa || $scope.label ? '' : 'fas fa-mouse-pointer';

        if ($scope.type.like('*add*|*new*')) {
          $scope.fa = 'fas fa-plus';
          $scope.class = 'btn-primary';
        } else if ($scope.type.like('*update*|*edit*')) {
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
        } else if ($scope.type.like('*view*|*details*|*show*')) {
          $scope.fa = 'fas fa-eye';
          $scope.class = 'btn-info';
        } else if ($scope.type.like('*delete*|*remove*|*clear*')) {
          $scope.fa = 'fas fa-trash';
          $scope.class = 'btn-danger';
        } else if ($scope.type.like('*exit*|*close*')) {
          $scope.fa = 'fas fa-times-circle';
          $scope.class = 'btn-danger';
        } else if ($scope.type.like('*print*')) {
          $scope.fa = 'fas fa-print';
          $scope.class = 'btn-secondary';
        } else if ($scope.type.like('*export*|*excel*')) {
          $scope.fa = 'fas fa-file-export';
          $scope.class = 'btn-light';
        } else if ($scope.type.like('*import*')) {
          $scope.fa = 'fas fa-file-upload';
          $scope.class = 'btn-light';
        } else if ($scope.type.like('*search*|*find*')) {
          $scope.fa = 'fas fa-search';
          $scope.class = 'btn-light';
        } else if ($scope.type.like('*login*|*signin*')) {
          $scope.fa = 'fas fa-sign-in-alt';
          $scope.class = 'btn-light';
        } else if ($scope.type.like('*logout*|*signout*')) {
          $scope.fa = 'fas fa-sign-out-alt';
          $scope.class = 'btn-light';
        } else if ($scope.type.like('*push*')) {
          $scope.fa = 'fas fa-plus-circle';
          $scope.class = 'btn-primary';
        } else if ($scope.type.like('*cancel*')) {
          $scope.fa = 'fas fa-minus-circle';
          $scope.class = 'btn-danger';
        } else if ($scope.type.like('*upload*')) {
          $scope.fa = 'fas fa-upload';
          $scope.class = 'btn-light';
        } else if ($scope.type.like('*up*')) {
          $scope.fa = 'fas fa-long-arrow-alt-up';
          $scope.class = 'btn-light';
        } else if ($scope.type.like('*down*')) {
          $scope.fa = 'fas fa-long-arrow-alt-down';
          $scope.class = 'btn-light';
        } else if ($scope.type.like('*reset*')) {
          $scope.fa = 'fas fa-sync-alt';
          $scope.class = 'btn-light';
        } else if ($scope.type.like('*stop*')) {
          $scope.fa = 'fas fa-stop';
          $scope.class = 'btn-light';
        } else if ($scope.type.like('*play*')) {
          $scope.fa = 'far fa-play-circle';
          $scope.class = 'btn-light';
        } else if ($scope.type.like('*copy*')) {
          $scope.fa = 'fas fa-copy';
          $scope.class = 'btn-light';
        }
        if ($scope.type.like('*default*')) {
          $scope.class = '';
        }
        if ($scope.class2) {
          $scope.class = $scope.class2;
        }
        $scope.onclick = function () {
          $scope.clickBusy = true;
          $timeout(() => {
            $scope.clickBusy = false;
          }, 250);
        };
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
  },
]);
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
        activeValue: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        $scope.primary = $scope.primary || 'id';
        $scope.display = $scope.display || 'name';
        $scope.display2 = $scope.display2 || '';
        $scope.space = $scope.space || ' - ';
        attrs.ngValue = attrs.ngValue || '';
        $scope.v = $scope.v || '';
        $scope.requird = '';
        if ($scope.v.like('*r*')) {
          $scope.requird = '*';
        }
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
            if (attrs.disabled !== 'disabled') {
              $scope.popupElement.css('display', 'block');
            }
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
          if (item) {
            $scope.ngModel = $scope.getNgValue(item, $scope.ngValue);
            if ($scope.display2) {
              input.val($scope.getNgModelValue($scope.ngModel) + $scope.space + $scope.getNgModelValue2($scope.ngModel));
            } else {
              input.val($scope.getNgModelValue($scope.ngModel));
            }
          } else {
            $scope.ngModel = null;
            input.val('');
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

app.directive('iDate', function ($timeout) {
  return {
    restrict: 'E',
    required: 'ngModel',
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
    link: function ($scope, element, attrs) {
      $scope.id2 = $scope.id2 || 'input_' + Math.random().toString().replace('0.', '');
      $scope.v = $scope.v || '';
      $scope.requird = '';
      if ($scope.v.like('*r*')) {
        $scope.requird = '*';
      }
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }
      $scope.class2 = $scope.class2 || '';

      $scope.model = {};

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
          { id: 0, name: 'January' },
          { id: 1, name: 'February' },
          { id: 2, name: 'March' },
          { id: 3, name: 'April' },
          { id: 4, name: 'May' },
          { id: 5, name: 'June' },
          { id: 6, name: 'July' },
          { id: 7, name: 'August' },
          { id: 8, name: 'September' },
          { id: 9, name: 'October' },
          { id: 10, name: 'November' },
          { id: 11, name: 'December' },
        ];
      }

      $scope.$watch('ngModel', function (ngModel) {
        if (ngModel) {
          ngModel = new Date(ngModel);
          $scope.model = $scope.model || {};
          $scope.model.selectedDay = site.addZero(ngModel.getDate(), 2);
          $scope.model.selectedMonth = $scope.monthes.find((m) => m.id == ngModel.getMonth());
          $scope.model.selectedYear = ngModel.getFullYear();
          $(element).attr('value', ngModel.getTime());
          $scope.ngModel1 = new Date(ngModel);
        } else {
          $scope.model = $scope.model || {};
          $scope.model.selectedDay = null;
          $scope.model.selectedMonth = null;
          $scope.model.selectedYear = null;
          $(element).attr('value', '');
        }
      });

      $scope.setDay = function () {
        $scope.ngModel = new Date();
      };
      $scope.updateDate = function (date) {
        if ($scope.ngModel1) {
          $scope.ngModel = $scope.ngModel1;
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
    link: function ($scope, element, attrs) {
      $scope.id2 = $scope.id2 || 'input_' + Math.random().toString().replace('0.', '');
      $scope.v = $scope.v || '';
      $scope.requird = '';
      if ($scope.v.like('*r*')) {
        $scope.requird = '*';
      }
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }
      $scope.class2 = $scope.class2 || '';

      $scope.model = {};

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
          { id: 0, name: 'January' },
          { id: 1, name: 'February' },
          { id: 2, name: 'March' },
          { id: 3, name: 'April' },
          { id: 4, name: 'May' },
          { id: 5, name: 'June' },
          { id: 6, name: 'July' },
          { id: 7, name: 'August' },
          { id: 8, name: 'September' },
          { id: 9, name: 'October' },
          { id: 10, name: 'November' },
          { id: 11, name: 'December' },
        ];
      }

      $scope.$watch('ngModel', function (ngModel) {
        if (ngModel) {
          ngModel = new Date(ngModel);
          $scope.model = $scope.model || {};
          $scope.model.selectedDay = site.addZero(ngModel.getDate(), 2);
          $scope.model.selectedMonth = $scope.monthes.find((m) => m.id == ngModel.getMonth());
          $scope.model.selectedYear = ngModel.getFullYear();
          $scope.model.selectedHour = site.addZero(ngModel.getHours(), 2);
          $scope.model.selectedMinute = site.addZero(ngModel.getMinutes(), 2);

          $scope.ngModel1 = new Date(ngModel);
          $scope.ngModel2 = new Date(0, 0, 0, ngModel.getHours(), ngModel.getMinutes());
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
        let time = $('#time_' + $scope.id2).val();

        if ($scope.ngModel1 && time) {
          $scope.ngModel = new Date($scope.ngModel1.getFullYear(), $scope.ngModel1.getMonth(), $scope.ngModel1.getDate(), time.split(':')[0], time.split(':')[1], 0);
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
        let button = $(element).find('i-button')[0];

        let progress = $(element).find('.progress')[0];
        let progressBar = $(element).find('.progress-bar')[0];
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
                progressBar.style.width = $scope.value + '%';
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
        $scope.accept = $scope.accept ? $scope.accept : 'image/*';
        $scope.viewOnly = $scope.view === undefined ? false : true;

        let input = $(element).find('input')[0];
        let img = $(element).find('img')[0];
        let progress = $(element).find('.progress')[0];
        $(progress).hide();

        $scope.upload = function () {
          if (!$scope.viewOnly) {
            input.click();
          }
        };
        $scope.delete = function () {
          img.src = null;
          $scope.ngModel = null;
        };

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
                $(progress).css('width', $scope.value);
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

app.directive('iAudio', [
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
        $scope.accept = $scope.accept ? $scope.accept : '.mp3';
        $scope.viewOnly = $scope.view === undefined ? false : true;

        let input = $(element).find('input')[0];
        let audio = $(element).find('audio')[0];
        let progress = $(element).find('.progress')[0];
        $(progress).hide();

        $scope.upload = function () {
          if (!$scope.viewOnly) {
            input.click();
          }
        };
        $scope.delete = function () {
          $scope.ngModel = null;
          audio.setAttribute('src', null);
        };

        input.addEventListener('change', function () {
          isite.uploadAudio(
            this.files,
            {
              folder: $scope.folder,
            },
            (err, audio, e) => {
              if (e) {
                $(progress).show();
                $scope.value = (e.loaded / e.total) * 100;
                $scope.max = e.total;
                $(progress).css('width', $scope.value);
                if ($scope.value === 100) {
                  $(progress).hide();
                }
              }

              if (audio) {
                $scope.ngModel = audio;
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
            audio.setAttribute('src', ngModel.url);
            audio.setAttribute('type', 'audio/mpeg');
          }
        });
      },
      template: `/*##client-side/directive/i-audio.html*/`,
    };
  },
]);

app.directive('iVideo', [
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
        $scope.accept = $scope.accept ? $scope.accept : '.mp4';
        $scope.viewOnly = $scope.view === undefined ? false : true;

        let input = $(element).find('input')[0];
        let video = $(element).find('video')[0];
        let progress = $(element).find('.progress')[0];
        $(progress).hide();

        $scope.upload = function () {
          if (!$scope.viewOnly) {
            input.click();
          }
        };
        $scope.delete = function () {
          $scope.ngModel = null;
          video.setAttribute('src', null);
        };

        input.addEventListener('change', function () {
          isite.uploadVideo(
            this.files,
            {
              folder: $scope.folder,
            },
            (err, video, e) => {
              if (e) {
                $(progress).show();
                $scope.value = (e.loaded / e.total) * 100;
                $scope.max = e.total;
                $(progress).css('width', $scope.value);
                if ($scope.value === 100) {
                  $(progress).hide();
                }
              }

              if (video) {
                $scope.ngModel = video;
                if ($scope.ngChange) {
                  $timeout(() => {
                    $scope.ngChange();
                  }, 200);
                }
              }
            }
          );
        });

        $scope.capture = function () {
          let canvas = document.createElement('canvas');
          canvas.width = video.videoWidth / 4;
          canvas.height = video.videoHeight / 4;
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
          $scope.ngModel.imageURL = canvas.toDataURL('image/jpeg');
        };

        video.addEventListener(
          'canplay',
          function (e) {
            $timeout(() => {
              $scope.capture();
            }, 2000);
          },
          false
        );

        $scope.$watch('ngModel', (ngModel) => {
          if (ngModel) {
            video.setAttribute('src', ngModel.url);
            video.setAttribute('type', 'video/mp4');
            video.load();
          }
        });
      },
      template: `/*##client-side/directive/i-video.html*/`,
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
                } else if (data) {
                  if ($scope.onUploaded) {
                    $scope.onUploaded({ $data: data });
                  }
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
