var mutual_friends, bmf_ajax_request = null;
(function( jq ) {

    mutual_friends = {

        init: function() {
            mutual_friends.init_maginific_popup();

            jq('body').on( 'click', 'a.mutual-friends', mutual_friends.fetch_mutual_friend );
            jq( 'body' ).on('click', '.friendship-button a', mutual_friends.add_remove_friendship )
            jq( document ).ajaxComplete( mutual_friends.rebind_magnific_popup );
            jq( 'body' ).on( 'click', 'a.bmf-load-more', mutual_friends.member_loop_next_page );
        },

        fetch_mutual_friend: function( e ) {

            jqelement = jq(this);

            e.preventDefault();

            jq('div.bmf-white-popup').html('<div class="bmf-spinner"></div>');

            var user_id = jqelement.data('user-id');
            var send_data = {
                action: 'mutual_friends_dialog',
                user_id: user_id
            };

            jq.post( ajaxurl, send_data, function( response ) {

                jq('div.bmf-white-popup').find("div.bmf-spinner").remove();
                jq('div.bmf-white-popup').append( '<button title="Close (Esc)" type="button" class="mfp-close">×</button>'+response );
                jq('div.bmf-white-popup').perfectScrollbar();
            });
        },

        init_maginific_popup: function () {

            jq('a.mutual-friends').magnificPopup({
                items: {
                    src: jq('<div id="buddypress" class="bmf-white-popup"></div>'),
                    type: 'inline'
                },
                showCloseBtn: true,
                closeBtnInside:true
            });
        },

        rebind_magnific_popup: function( event, xhr, settings ) {

            if (  null != bmf_ajax_request ) {
                bmf_ajax_request = null;
                return false;
            }

            var url = settings.data;
            var action = parameter_value( url, 'action' );

            if ( 'members_filter' == action ) {
                var timer = setTimeout( function() {

                    jqelement = jq('#buddypress').find('a.mutual-friends');

                    if ( 'undefined' != typeof jqelement ) {
                        mutual_friends.init_maginific_popup();
                        clearInterval( timer );
                        return false;
                    }
                }, 1000);
            }
        },
        
        add_remove_friendship: function() {

            jq(this).parent().addClass('loading');
            var fid   = jq(this).attr('id'),
                nonce   = jq(this).attr('href'),
                thelink = jq(this);

            fid = fid.split('-');
            fid = fid[1];

            nonce = nonce.split('?_wpnonce=');
            nonce = nonce[1].split('&');
            nonce = nonce[0];

            jq.post( ajaxurl, {
                    action: 'addremove_friend',
                    'cookie': bp_get_cookies(),
                    'fid': fid,
                    '_wpnonce': nonce
                },
                function(response)
                {
                    var action  = thelink.attr('rel');
                    parentdiv = thelink.parent();

                    if ( action === 'add' ) {
                        jq(parentdiv).fadeOut(200,
                            function() {
                                parentdiv.removeClass('add_friend');
                                parentdiv.removeClass('loading');
                                parentdiv.addClass('pending_friend');
                                parentdiv.fadeIn(200).html(response);
                            }
                        );

                    } else if ( action === 'remove' ) {
                        jq(parentdiv).fadeOut(200,
                            function() {
                                parentdiv.removeClass('remove_friend');
                                parentdiv.removeClass('loading');
                                parentdiv.addClass('add');
                                parentdiv.fadeIn(200).html(response);
                            }
                        );
                    }
                });
            return false;

        },

        member_loop_next_page: function( e ) {

            jqelement = jq(this).parent();
            jqparent_element = jqelement.parent();

            e.preventDefault();

            var next_page = parseInt( jqelement.data('next-page-no') );
            var total_page = parseInt( jqelement.data('total-page-count') );

            if ( next_page > total_page ) {
               jq('ul.activity-list').hide();
            } else {
                jqparent_element.addClass('loading');

                bmf_ajax_request = jq.post( ajaxurl, {
                        action: 'members_filter',
                        'cookie': bp_get_cookies(),
                        'object': 'members',
                        'search_terms': '',
                        'page': 2,
                        'template': ''
                    },
                    function(response)
                    {
                        jqparent_element.removeClass('loading');
                        var html = jq( response ).find('li');
                        jq('#members-list').append( html );

                    });
            }

            jqelement.data( 'next-page-no', next_page + 1 );
        }

    };

    jq( document).ready( function() { mutual_friends.init() });

})(jQuery);

function parameter_value( url, name ) {
    var result = new RegExp( name + "=([^&]*)", "i").exec(url);
    return result && unescape(result[1]) || "";
}