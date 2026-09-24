"""Browser regressions with a mock API; never mutates live accounts."""
import json
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    requests = []
    def api(route):
        request = route.request
        headers = {"access-control-allow-origin": "http://localhost:3100", "access-control-allow-credentials": "true", "access-control-allow-headers": "content-type,authorization", "access-control-allow-methods": "GET,POST,PUT,OPTIONS"}
        if request.method == "OPTIONS":
            route.fulfill(status=204, headers=headers)
            return
        requests.append(request)
        payload = {}
        if request.url.endswith('/auth/profile'):
            payload = {"user": {"id": "test-student", "name": "Test Student", "role": "student", "email": "student@example.test"}}
        elif '/notifications' in request.url and request.method == 'GET':
            payload = {"data": [{"id": "notice-1", "title": "Proposal reviewed", "body": "Read your mentor feedback.", "type": "feedback", "read": False}]}
        route.fulfill(status=200, content_type="application/json", body=json.dumps(payload), headers=headers)
    page.route('**/api/**', api)
    page.goto('http://localhost:3100/reset-password?token=' + 'a' * 64)
    page.wait_for_load_state('networkidle')
    page.get_by_label('New password', exact=True).fill('SyntheticOnly123')
    page.get_by_label('Confirm password', exact=True).fill('SyntheticOnly123')
    page.get_by_role('button', name='Update password securely').click()
    expect(page.get_by_text('Password updated.', exact=True)).to_be_visible()
    reset = next(r for r in requests if r.url.endswith('/auth/reset-password'))
    assert reset.post_data_json['newPassword'] == 'SyntheticOnly123'
    page.goto('http://localhost:3100/student/notifications')
    page.wait_for_load_state('networkidle')
    expect(page.get_by_text('Proposal reviewed', exact=True)).to_be_visible()
    page.get_by_role('button', name='Mark all read').click()
    expect(page.get_by_role('button', name='Mark all read')).to_have_count(0)
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    browser.close()
print('Recovery and notifications browser regression passed (mock API).')
