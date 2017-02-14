/**
 * Created by Administrator on 2017/2/14.
 */
/**
 * jquery.citys.js 1.0
 * http://jquerywidget.com
 */
;(function (factory) {
    if (typeof define === "function" && (define.amd || define.cmd) && !jQuery) {
        // AMD��CMD
        define([ "jquery" ],factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        //Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.support.cors = true;
    $.fn.citys = function(parameter,getApi) {
        if(typeof parameter == 'function'){ //����
            getApi = parameter;
            parameter = {};
        }else{
            parameter = parameter || {};
            getApi = getApi||function(){};
        }
        var defaults = {
            dataUrl:'http://passer-by.com/data_location/list.json',     //���ݿ��ַ
            dataType:'json',          //���ݿ�����:'json'��'jsonp'
            provinceField:'province', //ʡ���ֶ���
            cityField:'city',         //�����ֶ���
            areaField:'area',         //�����ֶ���
            code:0,                   //��������
            province:0,               //ʡ��,����Ϊ���������������
            city:0,                   //����,����Ϊ���������������
            area:0,                   //����,����Ϊ���������������
            required: true,           //�Ƿ����ѡһ��
            nodata: 'hidden',         //��������ʱ�ı�����ʽ:'hidden'����,'disabled'����,Ϊ�ղ����κδ���
            onChange:function(){}     //�����л�ʱ����,�ص����������������
        };
        var options = $.extend({}, defaults, parameter);
        return this.each(function() {
            //������
            var _api = {};
            var $this = $(this);
            var $province = $this.find('select[name="'+options.provinceField+'"]'),
                $city = $this.find('select[name="'+options.cityField+'"]'),
                $area = $this.find('select[name="'+options.areaField+'"]');
            $.ajax({
                url:options.dataUrl,
                type:'GET',
                crossDomain: true,
                dataType:options.dataType,
                jsonpCallback:'jsonp_location',
                success:function(data){
                    var province,city,area,hasCity;
                    if(options.code){   //������õ������룬����Ե������õ���Ϣ
                        var c = options.code - options.code%1e4;
                        if(data[c]){
                            options.province = c;
                        }
                        c = options.code - (options.code%1e4 ? options.code%1e2 : options.code);
                        if(data[c]){
                            options.city = c;
                        }
                        c = options.code%1e2 ? options.code : 0;
                        if(data[c]){
                            options.area = c;
                        }
                    }
                    var updateData = function(){
                        province = {},city={},area={};
                        hasCity = false;       //�ж��Ƿ��еؼ�����
                        for(var code in data){
                            if(!(code%1e4)){     //��ȡ���е�ʡ��������λ
                                province[code]=data[code];
                                if(options.required&&!options.province){
                                    if(options.city&&!(options.city%1e4)){  //ʡδ����ж�ΪֱϽ��
                                        options.province = options.city;
                                    }else{
                                        options.province = code;
                                    }
                                }else if(data[code].indexOf(options.province)>-1){
                                    options.province = isNaN(options.province)?code:options.province;
                                }
                            }else{
                                var p = code-options.province;
                                if(options.province&&p>0&&p<1e4){    //ͬʡ�ĳ��л����
                                    if(!(code%100)){
                                        hasCity = true;
                                        city[code]=data[code];
                                        if(options.required&&!options.city){
                                            options.city = code;
                                        }else if(data[code].indexOf(options.city)>-1){
                                            options.city = isNaN(options.city)?code:options.city;
                                        }
                                    }else if(p>9000){                   //ʡֱϽ�ؼ�������λ
                                        city[code]=data[code];
                                    }else if(hasCity){                  //��ֱϽ��
                                        var c = code-options.city;
                                        if(options.city&&c>0&&c<100){     //ͬ�����еĵ���
                                            area[code]=data[code];
                                            if(options.required&&!options.area){
                                                options.area = code;
                                            }else if(data[code].indexOf(options.area)>-1){
                                                options.area = isNaN(options.area)?code:options.area;
                                            }
                                        }
                                    }else{
                                        city[code]=data[code];            //ֱϽ��
                                        if(options.area){
                                            options.city = options.area;
                                            options.area = '';
                                        }
                                        if(options.required&&!options.city){
                                            options.city = code;
                                        }else if(data[code].indexOf(options.city)>-1){
                                            options.city = isNaN(options.city)?code:options.city;
                                        }
                                    }
                                }
                            }
                        }
                    };
                    var format = {
                        province:function(){
                            $province.empty();
                            if(!options.required){
                                $province.append('<option value=""> - ��ѡ�� - </option>');
                            }
                            for(var i in province){
                                $province.append('<option value="'+i+'">'+province[i]+'</option>');
                            }
                            if(options.province){
                                $province.val(options.province);
                            }
                            this.city();
                        },
                        city:function(){
                            $city.empty();
                            if(!options.required){
                                $city.append('<option value=""> - ��ѡ�� - </option>');
                            }
                            if(options.nodata=='disabled'){
                                $city.prop('disabled',$.isEmptyObject(city));
                            }else if(options.nodata=='hidden'){
                                $city.css('display',$.isEmptyObject(city)?'none':'');
                            }
                            for(var i in city){
                                $city.append('<option value="'+i+'">'+city[i]+'</option>');
                            }
                            if(options.city){
                                $city.val(options.city);
                            }
                            this.area();
                        },
                        area:function(){
                            $area.empty();
                            if(!hasCity){
                                $area.css('display','none');
                            }else{
                                $area.css('display','');
                                if(!options.required){
                                    $area.append('<option value=""> - ��ѡ�� - </option>');
                                }
                                if(options.nodata=='disabled'){
                                    $area.prop('disabled',$.isEmptyObject(area));
                                }else if(options.nodata=='hidden'){
                                    $area.css('display',$.isEmptyObject(area)?'none':'');
                                }
                                for(var i in area){
                                    $area.append('<option value="'+i+'">'+area[i]+'</option>');
                                }
                                if(options.area){
                                    $area.val(options.area);
                                }
                            }
                        }
                    };
                    //��ȡ��ǰ������Ϣ
                    _api.getInfo = function(){
                        var status = {
                            direct:!hasCity,
                            province:data[options.province]||'',
                            city:data[options.city]||'',
                            area:data[options.area]||'',
                            code:options.area||options.city||options.province
                        };
                        return status;
                    };
                    //�¼���
                    $province.on('change',function(){
                        options.province = $(this).val();
                        options.city = 0;
                        options.area = 0;
                        updateData();
                        format.city();
                        options.onChange(_api.getInfo());
                    });
                    $city.on('change',function(){
                        options.city = $(this).val();
                        options.area = 0;
                        updateData();
                        format.area();
                        options.onChange(_api.getInfo());
                    });
                    $area.on('change',function(){
                        options.area = $(this).val();
                        options.onChange(_api.getInfo());
                    });
                    //��ʼ��
                    updateData();
                    format.province();
                    if(options.code){
                        options.onChange(_api.getInfo());
                    }
                    getApi(_api);
                }
            });
        });
    };
}));