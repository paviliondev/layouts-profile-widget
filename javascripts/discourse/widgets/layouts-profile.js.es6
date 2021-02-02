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

function userLink(user, className, contents) {
  return h(`a.${className}`, {
    attributes: {
      href: user.usernameUrl,
      "data-user-card": user.username
    }
  }, contents);
}

export default layouts.createLayoutsWidget('profile', {  
  html(attrs, state) {
    const { currentUser } = this;
    let contents = [];

    if (currentUser) {
      contents.push([
        h('div.user-details', [
          userLink(currentUser, 'avatar', avatarImg('large', {
            template: currentUser.avatar_template,
            username: currentUser.username
          })),
          this.attach('sidebar-profile-name')
        ]),
        this.getQuickLinks()
      ]);
    } else {
      contents.push(
        h('div.widget-title', I18n.t(themePrefix('profile_widget.guest')))
      );
    }

    return h('div.widget-inner', contents);
  },
  
  getQuickLinks() {
    let links = settings.profile_links.split('|');
    
    links = links.reduce((result, name) => {
      let skip = (
        (name == 'messages' && !this.siteSettings.enable_personal_messages)
      )
      
      if (!skip) {
        result.push(this.getQuickLink(name));
      }
      
      return result;
    }, []);
    
    return h('div.quick-links', links.map(l => (this.attach('link', l))));
  },
  
  getQuickLink(name) {
    const path = this.currentUser.path;
    let result = {};
    
    switch(name) {
      case 'activity':
        result = {
          icon: "stream",
          href: `${path}/activity`,
          label: "user.activity_stream"
        }
        break;
      case 'messages':
        result = {
          icon: "envelope",
          href: `${path}/messages`,
          label: "user.private_messages"
        }
        break;
      case 'invites':
        result = {
          icon: "user-plus",
          href: `${path}/invited`,
          label: "user.invited.title",
        }
        break;
      case 'drafts':
        result = {
          icon: "pencil-alt",
          href: `${path}/activity/drafts`,
          label: "user_action_groups.15",
        }
        break;
      case 'preferences':
        result = {
          icon: "cog",
          href: `${path}/preferences`,
          label: "user.preferences"
        }
        break;
    }
    
    return result;
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
    
    const nameContents = [];
    if (name) {
      nameContents.push(userLink(currentUser, 'name', name));
    }
    nameContents.push(
      userLink(currentUser, 'username', formatUsername(username))
    );
    
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
