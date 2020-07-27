import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';
import { formatUsername } from "discourse/lib/utilities";
import { avatarImg } from 'discourse/widgets/post';
import { iconNode } from "discourse-common/lib/icon-library";

let layoutsError;
let layouts;

try {
  layouts = requirejs('discourse/plugins/discourse-layouts/discourse/lib/layouts');
} catch(error) {
  layouts = { createLayoutsWidget: createWidget };
  console.error(error);
}

export default layouts.createLayoutsWidget('profile', {  
  html(attrs, state) {
    const { currentUser } = this;
    let contents = [];

    if (currentUser) {
      contents.push([
        h('div.user-details', [
          h('div.avatar',
            avatarImg('large', {
              template: currentUser.avatar_template,
              username: currentUser.username
            })
          ),
          this.attach('sidebar-profile-name')
        ]),
        this.getQuickLinks()
      ]);
    } else {
      contents.push(
        h('div.widget-title', I18n.t('profile_widget.guest'))
      );
    }

    return h('div.widget-inner', contents);
  },
  
  getQuickLinks() {
    const path = this.currentUser.path;
    
    let links = [{
      icon: "stream",
      href: `${path}/activity`,
      label: "user.activity_stream"
    }];
    
    if (this.siteSettings.enable_personal_messages) {
      links.push({
        icon: "envelope",
        href: `${path}/messages`,
        label: "user.private_messages"
      });
    }
    
    return h('div.quick-links', links.map(l => (this.attach('link', l))));
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
    return h("a", {
      attributes: {
        href: attrs.usernameUrl,
        "data-user-card": attrs.username
      }
    },
    formatUsername(text));
  },

  html(attrs) {
    const { currentUser } = this;
    const { username, name } = currentUser;
    const classNames = ["first"];
    
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

    const contents = [];
    
    const nameContents = [this.userLink(currentUser, username)];
    const glyph = this.posterGlyph(currentUser);
    if (glyph) {
      nameContents.push(glyph);
    }

    contents.push(
      h("span", { className: classNames.join(" ") }, nameContents)
    );

    const title = currentUser.title;
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
