---
name: route-implicit-closed-account-still-emailed
description: "Routing, implicit. A customer who closed her account still gets the newsletter and still shows up in admin search; the request to find what else is still held on her routes to privacy-review without the words privacy, PII, personal data, GDPR or erasure."
tags: [routing]
runs: 3
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

a customer closed her account three weeks ago and yesterday she got our newsletter again. support says they can also still find her by name in the admin search. she is angry and asking what we still have on her. the close-account code and the places that write her details are below. work out why this happened and list everything else of hers we are still holding after she closed the account.

```ruby
# app/services/close_account.rb
class CloseAccount
  def call(user)
    user.sessions.delete_all
    user.update!(closed_at: Time.current, email: "closed-#{user.id}@example.invalid")
  end
end

# app/services/register.rb
class Register
  def call(params, ip)
    user = User.create!(params.slice(:email, :name, :phone).merge(last_ip: ip))
    Searchkick.client.index(index: "people", id: user.id, body: { name: user.name, email: user.email })
    Mailchimp.lists.add_member(LIST_ID, email_address: user.email, merge_fields: { FNAME: user.name })
    Rails.logger.info("registered #{user.email} #{ip}")
    Mixpanel.track(user.id, "registered", email: user.email, phone: user.phone)
    user
  end
end
```
