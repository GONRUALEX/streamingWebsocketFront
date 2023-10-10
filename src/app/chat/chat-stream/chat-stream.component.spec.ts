import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatStreamComponent } from './chat-stream.component';

describe('ChatStreamComponent', () => {
  let component: ChatStreamComponent;
  let fixture: ComponentFixture<ChatStreamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatStreamComponent]
    });
    fixture = TestBed.createComponent(ChatStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
