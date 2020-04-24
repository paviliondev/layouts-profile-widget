import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import { formatUsername } from "discourse/lib/utilities";
import { avatarImg } from 'discourse/widgets/post';
import { iconNode } from "discourse-common/lib/icon-library";

export default createWidget('layouts-profile', {
  tagName: 'div.user-profile.widget-container',
  buildKey: () => 'user-profile',

  defaultState(attrs) {
    return {
      topic: attrs.topic,
      bookmarked: attrs.topic ? attrs.topic.bookmarked : null
    };
  },
  
  html(attrs, state) {
    const { currentUser } = this;
    let contents = [];

    if (currentUser) {
      const username = currentUser.username;
      const userPath = currentUser.path;

      contents.push([
        h('div.user-details', [
          h('div.avatar',
            avatarImg('large', {
              template: currentUser.avatar_template,
              username
            })
          ),
          this.attach('sidebar-profile-name')
        ])
        /*this.attach('quick-access-profile', {
          path: currentUser.get("path"),
          showLogoutButton: false
        })*/
      ]);
    } else {
      contents.push(
        h('div.widget-title', I18n.t('profile_widget.guest'))
      );
    }

    return h('div.widget-inner', contents);
  }
});

createWidget("sidebar-profile-name", {
  tagName: "div.names.trigger-user-card",

  posterGlyph(attrs) {
    if (attrs.moderator) {
      return iconNode("shield-alt", {
        title: I18n.t("user.moderator_tooltip")
      });
    }
  },

  userLink(attrs, text) {
    return h(
      "a",
      {
        attributes: {
          href: attrs.usernameUrl,
          "data-user-card": attrs.username
        }
      },
      formatUsername(text)
    );
  },

  html(attrs) {
    const { currentUser } = this;
    const { username, name } = currentUser;
        
    const contents = [h("span", [this.userLink(currentUser, name)])];
    
    const classNames = ["first"];
    
    if (name) {
      classNames.push("full-name");
    }
    
    if (currentUser.staff) {
      classNames.push("staff");
    }
    if (currentUser.admin) {
      classNames.push("admin");
    }
    if (currentUser.moderator) {
      classNames.push("moderator");
    }
    if (currentUser.new_user) {
      classNames.push("new-user");
    }

    const nameContents = [this.userLink(currentUser, username)];

    const glyph = this.posterGlyph(currentUser);
    if (glyph) {
      nameContents.push(glyph);
    }

    contents.push(
      h("span", { className: classNames.join(" ") }, nameContents)
    );

    const title = currentUser.user_title;
    if (title && title.length) {
      
      const primaryGroupName = currentUser.primary_group_name;
      if (primaryGroupName && primaryGroupName.length) {
        classNames.push(primaryGroupName);
      }
      
      contents.push(
        this.attach("poster-name-title", { title, primaryGroupName })
      );
    }

    return contents;
  }
});
